/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { injectable, container } from 'tsyringe';
import log from 'heroku-logger';
import { MessageEmbed, GuildMember, Message, Guild } from 'discord.js';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import FindEnabledServerByDiscordIdService from '@modules/servers/services/FindEnabledServerByDiscordIdService';
import Server from '@modules/servers/entities/Server';
import serverConfig from '@config/serverConfig';

@injectable()
class RegisterWelcomeMessageProvider {
  public async execute(): Promise<void> {
    log.info('[RegisterWelcomeMessageProvider] Starting to register welcome message');

    try {
      const commandoClient = await container.resolve(ClientProvider).getCLient();

      const findEnabledServerByDiscordId = container.resolve(FindEnabledServerByDiscordIdService);

      commandoClient.on('guildMemberAdd', async member => {
        log.info('new member has join in a guild', {
          memberName: member.displayName,
          tag: member.user.tag,
          guildName: member.guild.name,
        });

        const { guild } = member;
        const server = await findEnabledServerByDiscordId.execute({
          discord_id: member.guild.id,
        });

        if (!server) {
          log.error(`server id ${member.guild.id} is not found or enabled`);
          return;
        }

        const { key: keyToggle } = serverConfig.welcome_message_toggle;
        const { key: keyChannel } = serverConfig.welcome_message_channel;
        const { key: keyReactions } = serverConfig.welcome_reactions;
        const eventEnabled = server.getConfiguration(keyToggle) === 'true';
        const channelId = server.getConfiguration(keyChannel);
        const reactions = server.getConfiguration(keyReactions);

        if (!eventEnabled || !channelId) {
          log.info('welcome message is disabled or not configured, not send welcome message to member', {
            eventEnabled,
            channelId,
          });
          return;
        }

        log.info('welcome message is enabled, sending welcome message', {
          eventEnabled,
          channelId,
        });

        const channel = guild.channels.cache.find(c => c.id === channelId);

        if (!channel || !channel.isText()) {
          log.error(`channel id ${channelId} not found or is not a text channel`, { channel });
          return;
        }

        channel.send(`Olá <@${member.id}>`);
        const sentMessage = await channel.send(this.createWelcomeEmbedMessage());

        this.setReactions(sentMessage, reactions, guild);
        this.setDefaultRole(server, member);
      });

      log.info('[RegisterWelcomeMessageProvider] Finished register welcome message');
    } catch (err) {
      log.error('Error while execute welcome message', [err.message, err.stack]);
    }
  }

  createWelcomeEmbedMessage(): MessageEmbed {
    const welcomeMessage = `
            Seja bem-vindo(a) à **Cobra Wing**.
            \nNo Elite Dangerous, nosso grupo privado é: **COBRA BR** e nosso esquadrão: **Cobra Wing Academy [CWAC]**.
            \nPara solicitar acesso digite **!grupoprivado** e/ou **!esquadrao** e/ou **!inara** na sala <#309828038286114816> e siga as instruções.
            \nLeia as <#117579849794715652> e o <#729066883378184192>, também pedimos que __use o mesmo apelido em jogo aqui no discord__, para ajudar na nossa identificação.
            \nAgora você é um convidado, __após entrar para o nosso esquadrão e inara__ você terá acesso as demais salas aqui no nosso discord.
            \nQuaisquer dúvidas é só perguntar ou digitar !ajuda. :wink:
            `;

    const embed = new MessageEmbed();
    embed.setColor('#EE0000');
    embed.setDescription(welcomeMessage);
    embed.setThumbnail(
      'https://cdn.discordapp.com/attachments/209390265121636352/729077478651461643/722565942298542254.png',
    );
    embed.setFooter('Fly safe cmdr!');
    embed.setTimestamp(new Date());
    return embed;
  }

  async setDefaultRole(serverConfiguration: Server, member: GuildMember): Promise<void> {
    const { key: keyDefaultRole } = serverConfig.welcome_default_role;
    const roleId = serverConfiguration.getConfiguration(keyDefaultRole);

    if (!roleId) {
      log.warn('default role is not configured');
      return;
    }

    const roleFoundInGuild = await member.guild.roles.fetch(roleId);

    if (!roleFoundInGuild) {
      log.warn(`role id: ${roleId} not found in guild`);
      return;
    }

    log.info(`setting role: ${roleFoundInGuild.name}`);

    const roleSetted = await member.roles.add(roleFoundInGuild, 'Cargo inicial, atribuído pelo bot.');

    log.debug(`role setted`, { roleSetted });
  }

  async setReactions(sentMessage: Message | undefined, reactions: string | undefined, guild: Guild): Promise<void> {
    if (!reactions || !sentMessage) {
      return;
    }

    const reactionIds = reactions.split('|');

    if (!reactionIds || reactionIds.length === 0) {
      return;
    }

    reactionIds.forEach(react => {
      if (react.length <= 2) {
        sentMessage.react(`${react}`).catch(e => {
          log.error('error while react with simple emoji', { e });
        });
      } else {
        const customReactExists = guild.emojis.cache.find(e => e.available === true && e.name === react);
        if (customReactExists) {
          sentMessage.react(customReactExists).catch(e => {
            log.error('error while react with a custom emoji', { e });
          });
        } else {
          log.error(`emoji name not found in guild`, { react });
        }
      }
    });
  }
}

export default RegisterWelcomeMessageProvider;
