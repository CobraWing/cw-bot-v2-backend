/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { injectable, container } from 'tsyringe';
import { Permissions } from 'discord.js';
import log from 'heroku-logger';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import UserHasRolePermission from '@modules/configurations/services/UserHasRolePermission';
import FindEnabledServerByDiscordIdService from '@modules/servers/services/FindEnabledServerByDiscordIdService';
import serverConfig from '@config/serverConfig';
import discordConfig from '@config/discordConfig';

interface IGuild {
  id: string;
  name: string;
  owner: boolean;
  icon: string;
}

interface IRequest {
  user_id: string;
  guilds: IGuild[];
}

@injectable()
class FilterPermittedGuilds {
  public async execute({
    user_id,
    guilds: userGuilds,
  }: IRequest): Promise<IGuild[]> {
    const discordClient = await container.resolve(ClientProvider).getCLient();
    const userHasRolePermission = container.resolve(UserHasRolePermission);
    const findEnabledServerByDiscordId = container.resolve(
      FindEnabledServerByDiscordIdService,
    );
    const { baseCDNUrl } = discordConfig.api;

    log.info(`[FilterPermittedGuilds] filter guilds for [user_id]`, {
      user_id,
    });

    try {
      const botGuilds = discordClient.guilds.cache;
      const permittedGuilds: IGuild[] = [];

      for (const botGuild of botGuilds.array()) {
        const botGuildWithUser = userGuilds.find(
          userGuild => userGuild.id === botGuild.id,
        );

        if (!botGuildWithUser) {
          continue;
        }

        botGuildWithUser.icon = `${baseCDNUrl}/icons/${botGuildWithUser.id}/${botGuildWithUser.icon}.png`;

        const userInGuild = await botGuild.members.fetch(user_id);
        const userOwnerOrAdmin =
          botGuildWithUser.owner ||
          userInGuild.hasPermission(new Permissions('ADMINISTRATOR'));

        if (userOwnerOrAdmin) {
          log.info(
            `[FilterPermittedGuilds] user is owner or admin for guild: ${botGuild.name}, check if guild id: ${botGuild.id} is registered or enabled`,
          );
          const server = await findEnabledServerByDiscordId.execute({
            discord_id: botGuild.id,
          });

          if (server) {
            log.info(
              '[FilterPermittedGuilds] guild is enabled, add to permitted guilds list',
              { server },
            );
            permittedGuilds.push(botGuildWithUser);
          } else {
            log.info('[FilterPermittedGuilds] guild not exists or disabled');
          }
        } else {
          const { key } = serverConfig.manage_server_role;

          log.info(
            `[FilterPermittedGuilds] check if user contains role: ${key} in guild ${botGuild.name}`,
          );

          const hasPermission = await userHasRolePermission
            .execute({
              user_id,
              discord_id: botGuild.id,
              configuration_key: key,
            })
            .catch(err => {
              log.error('Error while check if user has role permission', [
                err.message,
                err.stack,
              ]);
            });

          if (hasPermission) {
            log.info(
              `[FilterPermittedGuilds] User contains role, add in permitted guilds list`,
            );
            permittedGuilds.push(botGuildWithUser);
          }
        }
      }

      return permittedGuilds;
    } catch (err) {
      log.error('Error while filter permitted guilds', [
        err.message,
        err.stack,
      ]);
      throw new Error('Error while filter permitted guilds');
    }
  }
}

export default FilterPermittedGuilds;
