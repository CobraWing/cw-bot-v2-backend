/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { injectable, container } from 'tsyringe';
import log from 'heroku-logger';
import { MessageEmbed, Guild, TextChannel, MessageReaction, User } from 'discord.js';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import FindEnabledServerByDiscordIdService from '@modules/servers/services/FindEnabledServerByDiscordIdService';
import ServerConfiguration from '@modules/configurations/entities/ServerConfiguration';
import serverConfig from '@config/serverConfig';

interface IGuildToAddAutoRole {
  guild: Guild;
  textChannel: TextChannel;
  autoRoleInfos: ServerConfiguration[];
  messageIdWithRoles: string;
}

@injectable()
class RegisterAutoRoleProvider {
  private TITLE = 'Seleção de Tags!';

  private guildsToNotificate: IGuildToAddAutoRole[] = [];

  public async execute(): Promise<void> {
    log.info('[RegisterAutoRoleProvider] Starting load auto role');

    try {
      await this.getGuildsWithEnabledFeature();

      for await (const guildToAdd of this.guildsToNotificate) {
        if (await this.isNecessaryToAddMessage(guildToAdd)) {
          log.info('isNecessaryToAddMessage');
          this.sendNewMessageWithAutoRoles(guildToAdd);
        } else {
          log.info('NOT isNecessaryToAddMessage');
        }
      }
    } catch (err) {
      log.error('[RegisterAutoRoleProvider] Error while execute load auto role', [err.message, err.stack]);
    }

    const commandoClient = await container.resolve(ClientProvider).getCLient();

    commandoClient.on('raw', async (packet: any) => {
      if (packet.t !== 'MESSAGE_REACTION_ADD' && packet.t !== 'MESSAGE_REACTION_REMOVE') return;

      // We don't want this to run on unrelated packets
      // if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;

      // Grab the channel to check the message from
      // const channel = commandoClient.channels.get(packet.d.channel_id);

      const channel = commandoClient.channels.cache.find(c => c.id === packet.d.channel_id);

      if (!channel || !channel.isText) {
        log.info('channel not found');
        return;
      }

      // There's no need to emit if the message is cached, because the event will fire anyway for that
      if ((channel as TextChannel).messages.cache.find(m => m.id === packet.d.message_id)) {
        log.info("There's no need to emit if the message is cached, because the event will fire anyway for that");
        return;
      }

      const messages = await (channel as TextChannel).messages.fetch(undefined, false, true);

      log.info(`messages length: ${messages.size}`);

      for await (const [, message] of messages) {
        // Since we have confirmed the message is not cached, let's fetch it
        // channel.fetchMessage(packet.d.message_id).then(message => {

        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        // const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        // const reaction = message.reactions.get(emoji);

        let reaction;

        if (packet.d.emoji.id) {
          reaction = message.reactions.cache.find(r => r.emoji.id === packet.d.emoji.id);
        } else {
          reaction = message.reactions.cache.find(r => r.emoji.name === packet.d.emoji.name);
        }

        if (!reaction) return;

        // const reaction = message.reactions.cache.find(r => r.emoji === emoji);

        // message.reactions

        // Adds the currently reacting user to the reaction's users collection.
        // if (reaction) reaction.users.set(packet.d.user_id, commandoClient.users.get(packet.d.user_id));

        const user = commandoClient.users.cache.find(u => u.id === packet.d.user_id);

        if (!user) return;

        reaction.users.cache.set(packet.d.user_id, user);

        // Check which type of event it is before emitting

        if (packet.t === 'MESSAGE_REACTION_ADD') {
          // commandoClient.emit('messageReactionAdd', reaction, commandoClient.users.get(packet.d.user_id));
          log.info('emit add');
          commandoClient.emit('messageReactionAdd', reaction, user);
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
          // commandoClient.emit('messageReactionRemove', reaction, commandoClient.users.get(packet.d.user_id));
          log.info('emit remove');
          commandoClient.emit('messageReactionRemove', reaction, user);
        }
      }
    });

    commandoClient.on('messageReactionAdd', (messageReaction: MessageReaction, user: User) => {
      log.info('add', [messageReaction.emoji.name, messageReaction.emoji.id, user.username]);
    });

    commandoClient.on('messageReactionRemove', (messageReaction: MessageReaction, user: User) => {
      log.info('remove', [messageReaction.emoji.name, messageReaction.emoji.id, user.username]);
    });
  }

  public async getGuildsWithEnabledFeature(): Promise<void> {
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

      if (!server.getConfiguration(autoRoleEnabled) || !channelIdentifier) continue;

      const channel = guild?.channels.cache.find(c => c.name === channelIdentifier);

      if (channel && channel.isText() && autoRoleInfos) {
        autoRoleInfos.sort((a, b) => (parseInt(a.extra2, 10) > parseInt(b.extra2, 10) ? 1 : -1));
        this.guildsToNotificate.push({
          guild,
          textChannel: channel as TextChannel,
          autoRoleInfos,
          messageIdWithRoles: '',
        });
      }
    }
  }

  public async isNecessaryToAddMessage(guildToAdd: IGuildToAddAutoRole): Promise<boolean> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();

    const channel = (await guildToAdd.textChannel.fetch(true)) as TextChannel;
    const messages = await channel.messages.fetch(undefined, false, true);
    const autoRoleMessageEmbed = messages
      .filter(m => m.author.id === commandoClient.user?.id && m.embeds.length > 0)
      .map(m => m.embeds[0])
      .find(e => e.title === this.TITLE);

    if (!autoRoleMessageEmbed) return true;

    const autoRoleMessage = messages.find(m => m.embeds.includes(autoRoleMessageEmbed));

    if (!autoRoleMessage) return true;

    const autoRoleMessageReactions = autoRoleMessage.reactions.cache;

    if (autoRoleMessageReactions.size !== guildToAdd.autoRoleInfos.length) return true;

    for await (const info of guildToAdd.autoRoleInfos) {
      // Check if some emoji has been updated
      if (!autoRoleMessageReactions.find(reaction => reaction.emoji.name === info.value_alternative)) {
        await guildToAdd.textChannel.messages.delete(autoRoleMessage, 'Cause roles has been changed.');
        return true;
      }
      // Check if some description has been updated
      if (!autoRoleMessageEmbed.description?.includes(info.extra1.replace(/\\n/g, ''))) {
        await guildToAdd.textChannel.messages.delete(autoRoleMessage, 'Cause description roles has been changed.');
        return true;
      }
      // Check if some tag name has been updated
      if (!autoRoleMessageEmbed.description?.includes(info.value)) {
        await guildToAdd.textChannel.messages.delete(autoRoleMessage, 'Cause description roles has been changed.');
        return true;
      }
    }

    return false;
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

    guildToAdd.messageIdWithRoles = addedMessage.id;

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
}

export default RegisterAutoRoleProvider;
