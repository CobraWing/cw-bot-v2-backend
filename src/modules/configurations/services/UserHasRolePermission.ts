import { injectable, inject, container } from 'tsyringe';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import IConfigurationsRepository from '../repositories/IConfigurationsRepository';

interface IRequest {
  user_id: string;
  guild_id: string;
  configuration_key: string;
}

@injectable()
class UserHasRolePermission {
  constructor(
    @inject('ConfigurationsRepository')
    private configurationsRepository: IConfigurationsRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    user_id,
    guild_id,
    configuration_key,
  }: IRequest): Promise<boolean> {
    try {
      console.log(
        `[UserHasRolePermission] Check if user id={${user_id}} has permit key={${configuration_key}} in server id={${guild_id}}`,
      );

      const server = await this.serversRepository.findByIdDiscord(guild_id);

      const configuration = server?.configurations.find(
        config => config.key === configuration_key,
      );

      if (!configuration) {
        console.error(
          `Server id={${guild_id}} does not have key={${configuration_key}}`,
        );
        return false;
      }

      const discordClient = await container.resolve(ClientProvider).getCLient();

      if (!discordClient.uptime || discordClient.uptime <= 0) {
        console.error('Server does not connected.');
        return false;
      }

      const userGuild = discordClient.guilds.cache.find(
        guild => guild.id === guild_id,
      );

      if (!userGuild) {
        console.error('guild not found');
        return false;
      }

      if (!userGuild.available) {
        console.error('guild not available');
        return false;
      }

      const member = await userGuild.members.fetch(user_id);

      if (!member) {
        console.error('User not found in guild');
        return false;
      }

      const permissionRole = member.roles.cache.find(
        role => role.name === configuration.value,
      );

      return !!permissionRole;
    } catch (err) {
      console.error('[UserHasRolePermission] Error: ', err);
      return false;
    }
  }
}

export default UserHasRolePermission;
