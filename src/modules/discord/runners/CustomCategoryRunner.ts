import { container } from 'tsyringe';
import log from 'heroku-logger';
import { Message, MessageEmbed } from 'discord.js';
import Commando, { CommandInfo, CommandoMessage } from 'discord.js-commando';

import GetCategoryByNameWithEnabledCustomCommandsService from '@modules/categories/services/GetCategoryByNameWithEnabledCustomCommandsService';
import CommandCategory from '@modules/categories/entities/CommandCategory';

interface IGuildEnabledCategories {
  [key: string]: string[];
}

class CustomCategoryRunner extends Commando.Command {
  private getCategoryByNameWithEnabledCustomCommands: GetCategoryByNameWithEnabledCustomCommandsService;

  constructor(
    private guildEnabledCommands: IGuildEnabledCategories,
    client: Commando.CommandoClient,
    info: CommandInfo,
  ) {
    super(client, info);
    this.getCategoryByNameWithEnabledCustomCommands = container.resolve(
      GetCategoryByNameWithEnabledCustomCommandsService,
    );
  }

  async run(msg: CommandoMessage, _: string | string[] | object): Promise<Message | Message[]> {
    const [categoryName] = msg.content.toLowerCase().replace('!', '').split(' ');
    const { id: discord_id } = msg.guild;

    if (this.isCategoryFromThisServer(categoryName, discord_id)) {
      const category = await this.getCategoryByNameWithEnabledCustomCommands.execute({
        discord_id,
        name: categoryName,
      });

      if (!category) {
        return msg.message;
      }

      const embedMessage = this.createEmbedMessage(msg, category);

      return msg.embed(embedMessage);
    }
    log.info(`command ${categoryName} is not allowed in discord server name: ${msg.guild.name}`);

    return msg.message;
  }

  isCategoryFromThisServer(categoryName: string, discord_id: string): boolean {
    const guildRegisterCommands = this.guildEnabledCommands[discord_id];
    return guildRegisterCommands && guildRegisterCommands.includes(categoryName);
  }

  createEmbedMessage(msg: CommandoMessage, category: CommandCategory): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setColor('#EE0000');
    embed.setTitle(`Lista de comandos da categoria: ${category.name}`);
    embed.setDescription(
      category.customCommands.map(customCommand => {
        return `**!${customCommand.name}** - _ ${customCommand.description.replace(/_/g, ' ')}_ `;
      }),
    );
    embed.setAuthor(msg.member.displayName, msg.author.avatarURL() || '');
    embed.setFooter('Fly safe cmdr!');
    embed.setThumbnail('https://cdn.discordapp.com/attachments/340949096011399179/762792375814324224/list-512.png');
    embed.setTimestamp(new Date());
    return embed;
  }
}

export default CustomCategoryRunner;
