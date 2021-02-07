import { container } from 'tsyringe';
import { Message, MessageEmbed } from 'discord.js';
import Commando, { CommandoMessage } from 'discord.js-commando';
import log from 'heroku-logger';

import ListEnabledCategoriesWithEnabledCustomCommandsService from '@modules/categories/services/ListEnabledCategoriesWithEnabledCustomCommandsService';
import GetDefaultCommandByIdAndDiscordIdService from '@modules/default-commands/services/GetDefaultCommandByIdAndDiscordIdService';
import CommandCategory from '@modules/categories/entities/CommandCategory';
import ServerDefaultCommand from '@modules/default-commands/entities/ServerDefaultCommand';
import DefaultCommand from '@modules/default-commands/entities/DefaultCommand';

class HelpCommandRunner extends Commando.Command {
  private listEnabledCategoriesWithEnabledCustomCommands: ListEnabledCategoriesWithEnabledCustomCommandsService;

  private getDefaultCommandByIdAndDiscordIdService: GetDefaultCommandByIdAndDiscordIdService;

  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'ajuda',
      group: 'defaultcommands',
      memberName: `helpcommand`,
      description: `Comando de ajuda`,
      guildOnly: true,
      aliases: ['cwhelp', 'help', 'cwajuda'],
    });
    this.listEnabledCategoriesWithEnabledCustomCommands = container.resolve(
      ListEnabledCategoriesWithEnabledCustomCommandsService,
    );
    this.getDefaultCommandByIdAndDiscordIdService = container.resolve(GetDefaultCommandByIdAndDiscordIdService);
  }

  async run(msg: CommandoMessage, _: string | string[] | object): Promise<Message | Message[]> {
    const { id: discord_id } = msg.guild;

    const defaultCommandInfos = await this.getDefaultCommandByIdAndDiscordIdService.execute({
      discord_id,
      id: 'ajuda',
    });

    if (!defaultCommandInfos) {
      log.error('[HelpCommandRunner] Error while get default command by id and discord id');
      return msg.message;
    }

    if (!this.checkIfCommandIsEnabled(defaultCommandInfos)) {
      log.error('[HelpCommandRunner] command is not enabled', defaultCommandInfos);
      return msg.message;
    }

    const categories = await this.listEnabledCategoriesWithEnabledCustomCommands.execute({
      discord_id,
      show_in_menu: true,
    });

    if (!categories) {
      log.error('[HelpCommandRunner] Error while list enabled categories');
    }

    const embedMessage =
      defaultCommandInfos.custom_default_command && defaultCommandInfos.custom_default_command.custom
        ? this.createCustomEmbedMessage(msg, categories, defaultCommandInfos.custom_default_command)
        : this.createEmbedMessage(msg, categories, defaultCommandInfos);

    return msg.embed(embedMessage);
  }

  createCustomEmbedMessage(
    msg: CommandoMessage,
    categories: CommandCategory[] | undefined,
    customDefaultCommand: ServerDefaultCommand,
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setColor(customDefaultCommand.color || '#EE0000');
    embed.setTitle(customDefaultCommand.title);
    embed.setDescription(
      this.formatMessageContent(customDefaultCommand.content) + this.getCategoriesDescription(categories),
    );
    embed.setAuthor(msg.member.displayName, msg.author.avatarURL() || '');
    embed.setFooter(customDefaultCommand.footer_text || 'Fly safe cmdr!');
    embed.setThumbnail(customDefaultCommand.image_thumbnail);
    embed.setImage(customDefaultCommand.image_content);
    embed.setTimestamp(new Date());
    return embed;
  }

  createEmbedMessage(
    msg: CommandoMessage,
    categories: CommandCategory[] | undefined,
    defaultCommand: DefaultCommand,
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setColor(defaultCommand.color || '#EE0000');
    embed.setTitle(defaultCommand.title || 'Comandos de ajuda.');
    embed.setDescription(this.formatMessageContent(defaultCommand.content) + this.getCategoriesDescription(categories));
    embed.setAuthor(msg.member.displayName, msg.author.avatarURL() || '');
    embed.setFooter(defaultCommand.footer_text || 'Fly safe cmdr!');
    embed.setThumbnail(defaultCommand.image_thumbnail);
    embed.setImage(defaultCommand.image_content);
    embed.setTimestamp(new Date());
    return embed;
  }

  getCategoriesDescription(categories: CommandCategory[] | undefined): string {
    let message = '\n\n';
    if (categories) {
      categories.forEach(category => {
        message += `**!${category.name}** - _${category.description}_`;
        message += '\n';
      });
    }

    return message;
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
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
  }

  checkIfCommandIsEnabled(defaultCommand: DefaultCommand): boolean {
    let isEnabled = defaultCommand.enabled;
    if (!isEnabled) {
      return isEnabled;
    }
    const customDefaultCommand = defaultCommand.custom_default_command;

    if (customDefaultCommand) {
      isEnabled = customDefaultCommand.enabled;
    }

    return isEnabled;
  }
}

export default HelpCommandRunner;
