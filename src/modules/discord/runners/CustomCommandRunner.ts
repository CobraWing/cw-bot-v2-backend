/* eslint-disable no-plusplus */
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

      const embedMessages = this.createEmbedMessage(msg, command);

      embedMessages.forEach(embedMessage => {
        msg.embed(embedMessage);
      });

      return msg.message;
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
  ): MessageEmbed[] {
    const embeds = [] as MessageEmbed[];

    const contents = command.content
      ? this.formatMessageContent(command.content)
      : [''];

    for (let index = 0; index < contents.length; index++) {
      const content = contents[index];
      const first = index === 0;
      const last = index === contents.length - 1;
      const embed = new MessageEmbed();

      if (first) {
        embed.setTitle(command.title || '');
        embed.setAuthor(msg.member.displayName, msg.author.avatarURL() || '');
      }

      if (last) {
        embed.setImage(command.image_content || '');
        embed.setFooter('Fly safe cmdr!');
        embed.setTimestamp(new Date());
      }

      embed.setThumbnail(command.image_thumbnail || '');
      embed.setColor(command.color);
      embed.setDescription(content || '');

      embeds.push(embed);
    }

    return embeds;
  }

  formatMessageContent(content: string): string[] {
    return content
      .replace(/<\/p><p>/g, '\n')
      .replace(/<strong>|<\/strong>/g, '**')
      .replace(/<del>|<\/del>/g, '~~')
      .replace(/<u>|<\/u>/g, '__')
      .replace(/<em>|<\/em>/g, '*')
      .replace(/<p>|<\/p>/g, '')
      .replace(/http:\/\/www\.|https:\/\/www\./g, 'www.')
      .replace(/www\./g, 'https://www.')
      .replace(/&lt;\/&gt;/g, '</>')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .split('</>');
  }
}

export default CustomCommandRunner;
