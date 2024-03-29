import { injectable, inject, container, delay } from 'tsyringe';
import log from 'heroku-logger';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import IConfigurationsRepository from '../repositories/IConfigurationsRepository';
import ConfigurationsRepository from '../repositories/typeorm/ConfigurationsRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

interface IRequest {
  user_id: string;
  discord_id: string;
  configuration_key: string;
}

@injectable()
class UserHasRolePermission {
  constructor(
    @inject(delay(() => ConfigurationsRepository))
    private configurationsRepository: IConfigurationsRepository,
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ user_id, discord_id, configuration_key }: IRequest): Promise<boolean> {
    try {
      log.info(
        `[UserHasRolePermission] Check if user id={${user_id}} has permit key={${configuration_key}} in discord id={${discord_id}}`,
      );

      const server = await this.serversRepository.findByIdDiscordAndEnabledServer(discord_id).catch(err => {
        log.error('Error while find by id discord', [err.message, err.stack]);
        throw new Error('Error while find by id discord');
      });

      if (!server) {
        log.error(`Discord id={${discord_id}} not found`);
        throw new Error();
      }

      const configuration = server.server_configurations.find(config => config.configuration_id === configuration_key);

      if (!configuration) {
        log.error(`Discord id={${discord_id}} does not have configured key={${configuration_key}}`);
        throw new Error();
      }

      const discordClient = await container.resolve(ClientProvider).getCLient();

      if (!discordClient.uptime || discordClient.uptime <= 0) {
        log.error('Server does not connected.');
        throw new Error();
      }

      const userGuild = discordClient.guilds.cache.find(guild => guild.id === discord_id);

      if (!userGuild) {
        log.error('guild not found');
        throw new Error();
      }

      if (!userGuild.available) {
        log.error('guild not available', userGuild);
        throw new Error();
      }

      const member = await userGuild.members.fetch(user_id);

      if (!member) {
        log.error(`User with id=${user_id} not found in guild`);
        throw new Error();
      }

      const permissionRole = member.roles.cache.find(role => role.name === configuration.value);

      return !!permissionRole;
    } catch (err) {
      log.error('[UserHasRolePermission] Error: ', [err.message, err.stack]);
      return false;
    }
  }
}

export default UserHasRolePermission;
