/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
import { injectable, container } from 'tsyringe';

import log from 'heroku-logger';
import { MessageEmbed, GuildMember } from 'discord.js';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import FindEnabledServerByDiscordIdService from '@modules/servers/services/FindEnabledServerByDiscordIdService';
import Server from '@modules/servers/entities/Server';

@injectable()
class RegisterWelcomeMessageProvider {
  public async execute(): Promise<void> {
    log.info(
      '[RegisterWelcomeMessageProvider] Starting to register welcome message',
    );

    try {
      const commandoClient = await container
        .resolve(ClientProvider)
        .getCLient();

      commandoClient.on('guildMemberAdd', async member => {
        log.info('new member has join on guild', {
          memberName: member.displayName,
          tag: member.user.tag,
          guildName: member.guild.name,
        });

        const findEnabledServerByDiscordId = container.resolve(
          FindEnabledServerByDiscordIdService,
        );

        const guild = await findEnabledServerByDiscordId.execute({
          discord_id: member.guild.id,
        });

        if (
          guild &&
          guild.getConfiguration('WELCOME_MESSAGE_ENABLED') === 'true' &&
          !!guild.getConfiguration('WELCOME_MESSAGE_CHANNEL')
        ) {
          log.info('welcome message is enabled, sending welcome message');

          const welcomeChannel = guild.getConfiguration(
            'WELCOME_MESSAGE_CHANNEL',
          );

          const channel = member.guild.channels.cache.find(
            c => c.name === welcomeChannel,
          );

          if (!channel || !channel.isText()) {
            log.error(`channel name ${welcomeChannel} not found`);
            return;
          }

          channel.send(`Olá <@${member.id}>`);
          channel.send(this.createEmbedMessage());

          this.setDefaultRole(guild, member);
        } else {
          log.warn(
            'welcome message is disabled or not configured, not send welcome message to member',
          );
        }
      });

      log.info(
        '[RegisterWelcomeMessageProvider] Finished register welcome message',
      );
    } catch (e) {
      log.error('Error while register welcome message', { e });
    }
  }

  createEmbedMessage(): MessageEmbed {
    const welcomeMessage = `
            Seja bem-vindo(a) à **Cobra Wing**.
            \nNo Elite Dangerous, nosso grupo privado é: **COBRA BR** e nosso esquadrão: **COBRA WING [CWBR]**.
            \nPara solicitar acesso digite **!grupoprivado** e/ou **!esquadrao** e/ou **!inara** na sala <#309828038286114816> e siga as instruções.
            \nLeia as <#117579849794715652> e o <#729066883378184192>, também pedimos que __use o mesmo apelido em jogo aqui no discord__, para ajudar na nossa identificação.
            \nAgora você é um convidado, __após entrar para o nosso esquadrão e inara__ você terá acesso as demais salas aqui no nosso discord.
            \nQuaisquer dúvidas é só perguntar. :wink:
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

  setDefaultRole(serverConfiguration: Server, member: GuildMember): void {
    const defaultRoleId = serverConfiguration.getConfiguration(
      'WELCOME_DEFAULT_ROLE',
    );
    if (!defaultRoleId) {
      log.warn('default role is not configured');
      return;
    }

    const roleFoundInGuild = member.guild.roles.cache.find(
      r => r.id === `${defaultRoleId}`,
    );
    if (!roleFoundInGuild) {
      log.warn(`role: ${defaultRoleId} not found in guild`);
      return;
    }

    log.info(`setting role: ${roleFoundInGuild?.name}`);

    member.roles.add(roleFoundInGuild);
  }
}

export default RegisterWelcomeMessageProvider;
