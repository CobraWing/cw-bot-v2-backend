/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { injectable, container } from 'tsyringe';
import { Message, TextChannel } from 'discord.js';
import Commando, { CommandInfo, CommandoMessage } from 'discord.js-commando';

// import log from 'heroku-logger';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import ListEnabledCustomCommandService from '@modules/commands/services/ListEnabledCustomCommandService';

interface IGuildEnabledCommands {
  [key: string]: string[];
}

class CustomCommand extends Commando.Command {
  constructor(
    private guildEnabledCommands: IGuildEnabledCommands,
    client: Commando.CommandoClient,
    info: CommandInfo,
  ) {
    super(client, info);
  }

  async run(
    msg: CommandoMessage,
    _: string | string[] | object,
  ): Promise<Message | Message[]> {
    const [commandName] = msg.content.replace('!', '').split(' ');
    const guildRegisterCommands = this.guildEnabledCommands[msg.guild.id];

    if (guildRegisterCommands && guildRegisterCommands.includes(commandName)) {
      return msg.say('hello test');
    }

    return msg.message;
  }
}

@injectable()
class RegisterCustomCommandsProvider {
  public async execute(): Promise<void> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();
    const listEnabledCustomCommandService = container.resolve(
      ListEnabledCustomCommandService,
    );

    const guildEnabledCommands = {};
    const uniqueCommands = new Set();

    for await (const [id] of commandoClient.guilds.cache) {
      const commands = await listEnabledCustomCommandService.execute({
        discord_id: id,
      });

      Object.assign(guildEnabledCommands, {
        ...guildEnabledCommands,
        [id]: commands?.map(command => command.name),
      });
    }

    Object.values(guildEnabledCommands).forEach((values: any) => {
      for (const value of values) {
        uniqueCommands.add(value);
      }
    });

    commandoClient.registry.registerGroup('customcommands');

    const group = new Commando.CommandGroup(commandoClient, 'customcommands');

    const command = new CustomCommand(guildEnabledCommands, commandoClient, {
      name: `@customcommands`,
      group: group.id,
      memberName: `customcommands`,
      description: `Custom Commands`,
      guildOnly: true,
      aliases: Array.from(uniqueCommands.values()) as string[],
    });
    commandoClient.registry.registerCommand(command);
  }
}

export default RegisterCustomCommandsProvider;
