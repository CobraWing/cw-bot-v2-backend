import { container } from 'tsyringe';
import { Message } from 'discord.js';
import Commando, { CommandInfo, CommandoMessage } from 'discord.js-commando';
import GetCustomCommandByNameService from '@modules/commands/services/GetCustomCommandByNameService';

interface IGuildEnabledCommands {
  [key: string]: string[];
}

class CustomCommandRunner extends Commando.Command {
  private getCustomCommandByName: GetCustomCommandByNameService;

  constructor(
    private guildEnabledCommands: IGuildEnabledCommands,
    client: Commando.CommandoClient,
    info: CommandInfo,
  ) {
    super(client, info);
    this.getCustomCommandByName = container.resolve(
      GetCustomCommandByNameService,
    );
  }

  async run(
    msg: CommandoMessage,
    _: string | string[] | object,
  ): Promise<Message | Message[]> {
    const [commandName] = msg.content.toLowerCase().replace('!', '').split(' ');
    const { id: discord_id } = msg.guild;

    if (this.isCommandFromThisServer(commandName, discord_id)) {
      const command = await this.getCustomCommandByName.execute({
        discord_id,
        name: commandName,
      });

      return msg.say(command?.id);
    }

    return msg.message;
  }

  isCommandFromThisServer(commandName: string, discord_id: string): boolean {
    const guildRegisterCommands = this.guildEnabledCommands[discord_id];
    return guildRegisterCommands && guildRegisterCommands.includes(commandName);
  }
}

export default CustomCommandRunner;
