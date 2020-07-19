/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { injectable, container } from 'tsyringe';
import { Permissions } from 'discord.js';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import UserHasRolePermission from '@modules/configurations/services/UserHasRolePermission';
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
    const { baseCDNUrl } = discordConfig.api;

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
        permittedGuilds.push(botGuildWithUser);
      } else {
        const { configuration_key } = serverConfig.server_admin_role;

        const hasPermission = await userHasRolePermission.execute({
          user_id,
          guild_id: botGuild.id,
          configuration_key,
        });

        if (hasPermission) {
          permittedGuilds.push(botGuildWithUser);
        }
      }
    }

    return permittedGuilds;
  }
}

export default FilterPermittedGuilds;
