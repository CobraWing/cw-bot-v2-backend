import { container } from 'tsyringe';
import { Message, MessageEmbed } from 'discord.js';
import Commando, { CommandoMessage } from 'discord.js-commando';
import log from 'heroku-logger';

import serverConfig from '@config/serverConfig';

import GetDefaultCommandByIdAndDiscordIdService from '@modules/default-commands/services/GetDefaultCommandByIdAndDiscordIdService';
import FindEnabledServerByDiscordIdService from '@modules/servers/services/FindEnabledServerByDiscordIdService';
import RegisterWingCommandsProvider from '../providers/RegisterWingCommandsProvider';

class WingStatusRunner extends Commando.Command {
  private getDefaultCommandByIdAndDiscordIdService: GetDefaultCommandByIdAndDiscordIdService;

  private findEnabledServerByDiscordId: FindEnabledServerByDiscordIdService;

  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'status',
      group: RegisterWingCommandsProvider.groupName,
      memberName: `wingstatus`,
      description: `Comando de Status do esquedrão`,
      guildOnly: true,
      aliases: ['cwstatus'],
    });
    this.getDefaultCommandByIdAndDiscordIdService = container.resolve(
      GetDefaultCommandByIdAndDiscordIdService,
    );
    this.findEnabledServerByDiscordId = container.resolve(
      FindEnabledServerByDiscordIdService,
    );
  }

  async run(
    msg: CommandoMessage,
    _: string | string[] | object,
  ): Promise<Message | Message[]> {
    const { id: discord_id } = msg.guild;

    const server = await this.findEnabledServerByDiscordId.execute({
      discord_id,
    });

    if (!server) {
      log.error(`server id ${discord_id} is not found or enabled`);
      return msg.message; // TODO: Mensagem de erro
    }

    const { key: keyToggle } = serverConfig.wing_status_command_enabled;
    const { key: keyWingName } = serverConfig.wing_status_command_wing_name;

    const wingNameSetup = server.getConfiguration(keyWingName);
    const commandEnabled =
      wingNameSetup && server.getConfiguration(keyToggle) === 'true';

    if (!commandEnabled) {
      log.error(`command ${keyToggle} is not enabled or setupped`);
      return msg.message; // TODO: Mensagem de erro
    }

    const embed = new MessageEmbed();
    embed.setDescription(wingNameSetup);

    return msg.embed(embed);
  }
}

export default WingStatusRunner;
