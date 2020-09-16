/* eslint-disable max-classes-per-file */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { injectable, container } from 'tsyringe';
import { ChannelManager, Message, TextChannel } from 'discord.js';
import Commando, { CommandInfo, CommandoMessage } from 'discord.js-commando';

// import log from 'heroku-logger';
import ClientProvider from '@modules/discord/providers/ClientProvider';

class CustomCommand extends Commando.Command {
  constructor(client: Commando.CommandoClient, info: CommandInfo) {
    super(client, info);
  }

  async run(
    msg: CommandoMessage,
    args: string | string[] | object,
  ): Promise<Message | Message[]> {
    console.log('msg, args', msg, args);

    return msg.say('hello test');
  }
}

@injectable()
class RegisterCustomCommandsProvider {
  public async execute(): Promise<void> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();

    commandoClient.guilds.cache.forEach(guild => {
      // console.log(guild.id);

      commandoClient.registry.registerGroup(guild.id, guild.name);

      const command = new CustomCommand(commandoClient, {
        name: 'test',
        aliases: ['test2'],
        group: guild.id,
        memberName: 'test',
        description: `Custom Commands for ${guild.name}`,
        guildOnly: true,
      });
      commandoClient.registry.registerCommand(command);

      const c = guild.channels.cache.find(
        channel => channel.name === 'admin',
      ) as TextChannel;
      c.send('hello');
    });
  }
}

export default RegisterCustomCommandsProvider;
