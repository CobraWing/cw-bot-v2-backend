/* eslint-disable no-unused-expressions */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { injectable, container } from 'tsyringe';
import log from 'heroku-logger';
import { MessageEmbed, Guild, TextChannel, MessageReaction, User, Message, Role } from 'discord.js';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import FindEnabledServerByDiscordIdService from '@modules/servers/services/FindEnabledServerByDiscordIdService';
import ServerConfiguration from '@modules/configurations/entities/ServerConfiguration';
import serverConfig from '@config/serverConfig';

interface IGuildToAddAutoRole {
  guild: Guild;
  textChannel: TextChannel;
  autoRoleInfos: ServerConfiguration[];
  messageWithRoles: Message;
}

interface ICheckChannelMessage {
  necessarySend: boolean;
  messageToUpdate?: MessageEmbed;
}

@injectable()
class RegisterAutoRoleProvider {
  private TITLE = 'Seleção de Tags!';

  private guildsToNotificate: IGuildToAddAutoRole[] = [];

  public async execute(): Promise<void> {
    log.info('[RegisterAutoRoleProvider] Starting load auto role');

    try {
      await this.loadGuildsWithEnabledFeature();

      for await (const guildToAdd of this.guildsToNotificate) {
        const { necessarySend, messageToUpdate } = await this.isNecessaryToAddMessage(guildToAdd);

        if (necessarySend) {
          if (messageToUpdate) {
            log.debug(
              `[RegisterAutoRoleProvider] is necessary to update auto role message in guild: ${guildToAdd.guild.name}`,
            );
            this.updateMessageWithAutoRoles(guildToAdd, messageToUpdate);
          } else {
            log.debug(
              `[RegisterAutoRoleProvider] is necessary to send auto role message in guild: ${guildToAdd.guild.name}`,
            );
            this.sendNewMessageWithAutoRoles(guildToAdd);
          }
        } else {
          log.debug(
            `[RegisterAutoRoleProvider] not is necessary to update or create auto role message in guild: ${guildToAdd.guild.name}`,
          );
        }
      }
    } catch (err) {
      log.error('[RegisterAutoRoleProvider] Error while execute load auto role', [err.message, err.stack]);
    }

    const commandoClient = await container.resolve(ClientProvider).getCLient();

    commandoClient.on('messageReactionAdd', async (messageReaction: MessageReaction, user: User) => {
      // log.info('add', [messageReaction.emoji.name, messageReaction.emoji.id, user.username]);

      if (user.bot) return;

      const guildAutoRole = this.getGuildAutoRoleFromMessageReacted(messageReaction);

      if (!guildAutoRole) return;

      const guildRole = this.validateAndGetGuildRole(guildAutoRole, messageReaction);

      if (!guildRole) return;

      const guildMember = await guildAutoRole.guild.members.fetch(user);

      if (!guildMember) return;

      guildMember.roles.add(guildRole, 'Adicionado por auto-tag');
    });

    commandoClient.on('messageReactionRemove', async (messageReaction: MessageReaction, user: User) => {
      // log.info('remove', [messageReaction.emoji.name, messageReaction.emoji.id, user.username]);

      if (user.bot) return;

      const guildAutoRole = this.getGuildAutoRoleFromMessageReacted(messageReaction);

      if (!guildAutoRole) return;

      const guildRole = this.validateAndGetGuildRole(guildAutoRole, messageReaction);

      if (!guildRole) return;

      const guildMember = await guildAutoRole.guild.members.fetch(user);

      if (!guildMember) return;

      guildMember.roles.remove(guildRole, 'Removido por auto-tag');
    });
  }

  public validateAndGetGuildRole(
    guildAutoRole: IGuildToAddAutoRole,
    messageReaction: MessageReaction,
  ): Role | undefined {
    const autoRole = this.getAutoRoleInfoFromMessageReaction(guildAutoRole, messageReaction);

    if (!autoRole) {
      const mReaction = guildAutoRole.messageWithRoles.reactions.resolve(messageReaction);
      if (mReaction) {
        mReaction.remove();
      }
      return undefined;
    }

    return guildAutoRole.guild.roles.cache.find(r => r.name === autoRole.value);
  }

  public async loadGuildsWithEnabledFeature(): Promise<void> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();
    const findEnabledServerByDiscordIdService = container.resolve(FindEnabledServerByDiscordIdService);

    for await (const [discord_id, guild] of commandoClient.guilds.cache) {
      if (!guild.available) continue;

      const server = await findEnabledServerByDiscordIdService.execute({ discord_id });

      if (!server) continue;

      const { key: autoRoleEnabled } = serverConfig.auto_role_enabled;
      const { key: autoRoleChannel } = serverConfig.auto_role_channel;
      const { key: autoRoleInfo } = serverConfig.auto_role_info;
      const channelIdentifier = server.getConfiguration(autoRoleChannel);
      const autoRoleInfos = server.findConfiguration(autoRoleInfo);

      if (server.getConfiguration(autoRoleEnabled) !== 'true' || !channelIdentifier) continue;

      const channel = guild?.channels.cache.find(c => c.name === channelIdentifier);

      if (channel && channel.isText() && autoRoleInfos) {
        autoRoleInfos.sort((a, b) => (parseInt(a.extra2, 10) > parseInt(b.extra2, 10) ? 1 : -1));
        this.guildsToNotificate.push({
          guild,
          textChannel: channel as TextChannel,
          autoRoleInfos,
          messageWithRoles: {} as Message,
        });
      }
    }
  }

  public async isNecessaryToAddMessage(guildToAdd: IGuildToAddAutoRole): Promise<ICheckChannelMessage> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();

    const channel = (await guildToAdd.textChannel.fetch(true)) as TextChannel;
    const messages = await channel.messages.fetch(undefined, false, true);
    const autoRoleMessageEmbed = messages
      .filter(m => m.author.id === commandoClient.user?.id && m.embeds.length > 0)
      .map(m => m.embeds[0])
      .find(e => e.title === this.TITLE);

    if (!autoRoleMessageEmbed) return { necessarySend: true };

    const autoRoleMessage = messages.find(m => m.embeds.includes(autoRoleMessageEmbed));

    if (!autoRoleMessage) return { necessarySend: true };

    const autoRoleMessageReactions = autoRoleMessage.reactions.cache;

    if (autoRoleMessageReactions.size !== guildToAdd.autoRoleInfos.length)
      return { necessarySend: true, messageToUpdate: autoRoleMessageEmbed };

    for await (const info of guildToAdd.autoRoleInfos) {
      guildToAdd.messageWithRoles = autoRoleMessage;

      // Check if some emoji has been updated
      if (!autoRoleMessageReactions.find(reaction => reaction.emoji.name === info.value_alternative)) {
        // await guildToAdd.textChannel.messages.delete(autoRoleMessage, 'Cause roles has been changed.');
        return { necessarySend: true, messageToUpdate: autoRoleMessageEmbed };
      }
      // Check if some description has been updated
      if (!autoRoleMessageEmbed.description?.includes(info.extra1.replace(/\\n/g, ''))) {
        // await guildToAdd.textChannel.messages.delete(autoRoleMessage, 'Cause description roles has been changed.');
        return { necessarySend: true, messageToUpdate: autoRoleMessageEmbed };
      }
      // Check if some tag name has been updated
      if (!autoRoleMessageEmbed.description?.includes(info.value)) {
        // await guildToAdd.textChannel.messages.delete(autoRoleMessage, 'Cause description roles has been changed.');
        return { necessarySend: true, messageToUpdate: autoRoleMessageEmbed };
      }
    }

    return { necessarySend: false, messageToUpdate: autoRoleMessageEmbed };
  }

  public async updateMessageWithAutoRoles(
    guildToAdd: IGuildToAddAutoRole,
    messageToUpdate: MessageEmbed,
  ): Promise<void> {
    if (!guildToAdd.messageWithRoles) return;

    const listOfEmojiNamesForNewConfig: any[] = [];
    let roleDescriptions = 'Saudações comandante!';
    roleDescriptions += '\n';
    roleDescriptions += 'Escolha as suas tags aqui no servidor de acordo com o seu modo de jogo.';
    roleDescriptions += '\n';
    roleDescriptions += 'Para isso, basta reagir ao emojis abaixo (quantos desejar):';
    roleDescriptions += '\n\n';
    roleDescriptions += guildToAdd.autoRoleInfos
      .map(info => {
        const emoji = this.resolveEmoji(guildToAdd.guild, info.value_alternative);
        listOfEmojiNamesForNewConfig.push(info.value_alternative);

        return `${emoji} - **${info.value}** - ${info.extra1.replace('\\n', '\n')}`;
      })
      .join('\n');

    messageToUpdate.setDescription(roleDescriptions);
    guildToAdd.messageWithRoles.edit(messageToUpdate);

    // find current emoji in config, if not found, remove it.
    guildToAdd.messageWithRoles.reactions.cache.forEach(currentEmoji => {
      const foundEmoji = listOfEmojiNamesForNewConfig.find(emojiName => emojiName === currentEmoji.emoji.name);
      if (!foundEmoji) {
        currentEmoji.remove();
      }
    });

    // find new config that not contains in current message and add it
    listOfEmojiNamesForNewConfig.forEach(newConfig => {
      const foundEmoji = guildToAdd.messageWithRoles.reactions.cache.find(
        currentReaction => currentReaction.emoji.name === newConfig,
      );
      if (!foundEmoji) {
        const emoji = this.resolveEmoji(guildToAdd.guild, newConfig);
        guildToAdd.messageWithRoles.react(emoji);
      }
    });

    log.info(
      `[RegisterAutoRoleProvider] update message for auto role in guild: ${guildToAdd.guild.name} for channel: ${guildToAdd.textChannel.name}`,
    );
  }

  public async sendNewMessageWithAutoRoles(guildToAdd: IGuildToAddAutoRole): Promise<void> {
    const emojis: any[] = [];
    let roleDescriptions = 'Saudações comandante!';
    roleDescriptions += '\n';
    roleDescriptions += 'Escolha as suas tags aqui no servidor de acordo com o seu modo de jogo.';
    roleDescriptions += '\n';
    roleDescriptions += 'Para isso, basta reagir ao emojis abaixo (quantos desejar):';
    roleDescriptions += '\n\n';
    roleDescriptions += guildToAdd.autoRoleInfos
      .map(info => {
        const emoji = this.resolveEmoji(guildToAdd.guild, info.value_alternative);
        emojis.push(emoji);

        return `${emoji} - **${info.value}** - ${info.extra1.replace('\\n', '\n')}`;
      })
      .join('\n');

    const embed = new MessageEmbed()
      .setTitle(this.TITLE)
      .setDescription(roleDescriptions)
      .setColor('#EE0000')
      .setThumbnail('https://cdn.discordapp.com/attachments/209390265121636352/772561373648388101/logo.png')
      .setFooter('Para solicitar outras tags além dessas, entre em contato com a moderação.');

    const addedMessage = await guildToAdd.textChannel.send(embed);

    guildToAdd.messageWithRoles = addedMessage;

    emojis.forEach(emoji => {
      addedMessage.react(emoji);
    });

    log.info(
      `[RegisterAutoRoleProvider] added message for auto role in guild: ${guildToAdd.guild.name} for channel: ${guildToAdd.textChannel.name}`,
    );
  }

  private resolveEmoji(guild: Guild, value: string): any {
    if (/\p{Extended_Pictographic}/u.test(value) === false) {
      const emojiFound = guild.emojis.cache.find(e => e.available === true && e.name === value);
      if (!emojiFound) {
        throw Error(`Emoji not found: ${value} in guild: ${guild.name}`);
      }
      return emojiFound;
    }

    return value;
  }

  private getGuildAutoRoleFromMessageReacted(messageReaction: MessageReaction): IGuildToAddAutoRole | undefined {
    const guildToAddAutoRole = this.guildsToNotificate.find(
      guild => guild.messageWithRoles?.id === messageReaction.message.id,
    );

    return guildToAddAutoRole;
  }

  private getAutoRoleInfoFromMessageReaction(
    guildToAddAutoRole: IGuildToAddAutoRole,
    messageReaction: MessageReaction,
  ): ServerConfiguration | undefined {
    const autoRoleInfo = guildToAddAutoRole.autoRoleInfos.find(
      info => info.value_alternative === messageReaction.emoji.name,
    );

    return autoRoleInfo;
  }
}

export default RegisterAutoRoleProvider;
