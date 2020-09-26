import { container } from 'tsyringe';
import { Message, MessageEmbed } from 'discord.js';
import Commando, { CommandoMessage } from 'discord.js-commando';
import ListEnabledCategoriesWithEnabledCustomCommandsService from '@modules/categories/services/ListEnabledCategoriesWithEnabledCustomCommandsService';
import CommandCategory from '@modules/categories/entities/CommandCategory';

class HelpCommandRunner extends Commando.Command {
  private listEnabledCategoriesWithEnabledCustomCommands: ListEnabledCategoriesWithEnabledCustomCommandsService;

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
  }

  async run(
    msg: CommandoMessage,
    _: string | string[] | object,
  ): Promise<Message | Message[]> {
    const { id: discord_id } = msg.guild;
    const categories = await this.listEnabledCategoriesWithEnabledCustomCommands.execute(
      {
        discord_id,
        show_in_menu: true,
      },
    );

    if (!categories) {
      return msg.message;
    }

    const embedMessage = this.createEmbedMessage(msg, categories);

    return msg.embed(embedMessage);
  }

  createEmbedMessage(
    msg: CommandoMessage,
    categories: CommandCategory[],
  ): MessageEmbed {
    const embed = new MessageEmbed();
    embed.setColor('#EE0000');
    embed.setTitle('Comando de ajuda do Cobra Wing Bot');
    embed.setDescription(this.getCategoriesDescription(categories));
    embed.setAuthor(msg.member.displayName, msg.author.avatarURL() || '');
    embed.setFooter('Fly safe cmdr!');
    embed.setTimestamp(new Date());
    return embed;
  }

  getCategoriesDescription(categories: CommandCategory[]): string {
    let message = '\n';
    message +=
      'Abaixo os menus de categorias que você pode acessar digitando:\n\n';
    if (categories) {
      categories.forEach(category => {
        message += `**!${category.name}** - _${category.description}_`;
        message += '\n';
      });
    }

    return message;
  }
}

export default HelpCommandRunner;
