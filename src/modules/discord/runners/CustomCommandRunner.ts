import { container } from 'tsyringe';
import log from 'heroku-logger';
import { Message, MessageEmbed } from 'discord.js';
import Commando, { CommandInfo, CommandoMessage } from 'discord.js-commando';
import GetCustomCommandByNameService from '@modules/commands/services/GetCustomCommandByNameService';
import CustomCommand from '@modules/commands/entities/CustomCommand';

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

      if (!command) {
        return msg.message;
      }

      const embedMessage = this.createEmbedMessage(msg, command);

      return msg.embed(embedMessage);
    }
    log.info(
      `command ${commandName} is not allowed in discord server name: ${msg.guild.name}`,
    );

    return msg.message;
  }

  isCommandFromThisServer(commandName: string, discord_id: string): boolean {
    const guildRegisterCommands = this.guildEnabledCommands[discord_id];
    return guildRegisterCommands && guildRegisterCommands.includes(commandName);
  }

  createEmbedMessage(
    msg: CommandoMessage,
    command: CustomCommand,
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setColor(command.color);
    embed.setTitle(command.title || '');
    embed.setDescription(
      command.content ? this.formatMessageContent(command.content) : '',
    );
    embed.setImage(command.image_content || '');
    embed.setThumbnail(command.image_thumbnail || '');
    embed.setAuthor(msg.member.displayName, msg.author.avatarURL() || '');
    embed.setFooter('Fly safe cmdr!');
    embed.setTimestamp(new Date());
    return embed;
  }

  formatMessageContent(content: string): string {
    return content
      .replace(/<\/p><p>/g, '\n')
      .replace(/<strong>|<\/strong>/g, '**')
      .replace(/<del>|<\/del>/g, '~~')
      .replace(/<u>|<\/u>/g, '__')
      .replace(/<em>|<\/em>/g, '*')
      .replace(/<p>|<\/p>/g, '')
      .replace(/http:\/\/www\.|https:\/\/www\./g, 'www.')
      .replace(/www\./g, 'https://www.')
      .replace(/&gt;/g, '<')
      .replace(/&amp;/g, '&');
  }
}

export default CustomCommandRunner;
