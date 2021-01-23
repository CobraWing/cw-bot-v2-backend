/* eslint-disable no-new-wrappers */
/* eslint-disable no-plusplus */
import { container } from 'tsyringe';
import { GuildEmoji, Message, MessageEmbed } from 'discord.js';
import Commando, { CommandoMessage } from 'discord.js-commando';
import { formatDistance } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import pad from 'pad';
import capitalize from 'capitalize';

import log from 'heroku-logger';

import serverConfig from '@config/serverConfig';

import GetFactionPresencesByNameService from '@modules/elitebgs/services/GetFactionPresencesByNameService';
import FindEnabledServerByDiscordIdService from '@modules/servers/services/FindEnabledServerByDiscordIdService';
import RegisterWingCommandsProvider from '../providers/RegisterWingCommandsProvider';

class WingStatusRunner extends Commando.Command {
  private getFactionPresencesByNameService: GetFactionPresencesByNameService;

  private findEnabledServerByDiscordId: FindEnabledServerByDiscordIdService;

  constructor(client: Commando.CommandoClient) {
    super(client, {
      name: 'status',
      group: RegisterWingCommandsProvider.groupName,
      memberName: `wingstatus`,
      description: `Comando de Status do esquadrão`,
      guildOnly: true,
      aliases: ['cwstatus'],
    });
    this.getFactionPresencesByNameService = container.resolve(GetFactionPresencesByNameService);
    this.findEnabledServerByDiscordId = container.resolve(FindEnabledServerByDiscordIdService);
  }

  async run(msg: CommandoMessage, _: string | string[] | object): Promise<Message | Message[]> {
    const { id: discord_id } = msg.guild;
    const waitMessage = await msg.channel.send('Aguarde um instante, consultando os sistemas...');

    const server = await this.findEnabledServerByDiscordId.execute({
      discord_id,
    });

    if (!server) {
      log.error(`server id ${discord_id} is not found or enabled`);
      msg.react('👎');
      msg.reply('Ocorreu algum problema nas consultas, tente novamente em alguns instantes.');
      waitMessage.delete();
      return msg.message; // TODO: Mensagem de erro
    }

    const { key: keyToggle } = serverConfig.wing_status_command_enabled;
    const { key: keyWingName } = serverConfig.wing_status_command_wing_name;

    const factionName = server.getConfiguration(keyWingName);
    const commandEnabled = server.getConfiguration(keyToggle) === 'true';

    if (!commandEnabled || !factionName) {
      log.error(`command ${keyToggle} is not enabled or setupped`);
      msg.react('👎');
      msg.reply('Ocorreu algum problema nas consultas, tente novamente em alguns instantes.');
      waitMessage.delete();
      return msg.message; // TODO: Mensagem de erro
    }

    const wingStatus = await this.getFactionPresencesByNameService.execute({
      factionName,
    });

    const { formatState } = this.getFactionPresencesByNameService;

    const iconEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'orangeicon') || '🔸';
    const controlledEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'cwlogo') || '👑';
    const increasedUpEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'up') || '🟢';
    const increasedDownEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'down') || '🔴';

    const numberOfSystems = wingStatus.faction_presence.length;
    const numberOfControlledSystems = wingStatus.faction_presence.filter(
      presence => presence.controlledByFaction === true,
    ).length;

    const namesOfConflictsSystems = wingStatus.faction_presence
      .filter(presence => presence.conflicts.length > 0)
      .filter(presence => presence.state.toLowerCase() === 'war' || presence.state.toLowerCase() === 'election')
      .map(presence => `**${presence.system_name}**`);
    const numberOfConflictsSystems = namesOfConflictsSystems.length;

    const namesOfPendingConflictsSystems = wingStatus.faction_presence
      .filter(
        presence =>
          presence.pending_states.filter(
            ps => ps.state.toLowerCase() === 'war' || ps.state.toLowerCase() === 'election',
          ).length > 0,
      )
      .map(presence => `**${presence.system_name}**`);
    const numberOfPendingConflictsSystems = namesOfPendingConflictsSystems.length;

    const incompletedInfos = wingStatus.lostInfos;

    let factionDescription = `${iconEmoji} Total de sistemas: **${numberOfSystems}**\n`;

    if (!incompletedInfos) {
      factionDescription += `${controlledEmoji} Sistemas controlados: **${numberOfControlledSystems}**\n`;
    }

    factionDescription += '\n⚔️ Sistemas em conflito: ';
    if (numberOfConflictsSystems > 0) {
      factionDescription += `**${numberOfConflictsSystems}** - (${namesOfConflictsSystems.join(', ')})`;
    } else {
      factionDescription += '**Nenhum**';
    }

    factionDescription += '\n⚔️ Sistemas pendente conflito: ';
    if (numberOfPendingConflictsSystems > 0) {
      factionDescription += `**${numberOfPendingConflictsSystems}** - (${namesOfPendingConflictsSystems.join(', ')})`;
    } else {
      factionDescription += '**Nenhum**';
    }

    if (incompletedInfos) {
      factionDescription += '\n\n⚠️ Algumas informações estão incompletas por indisponibilidades no EDSM.';
    }
    factionDescription += '\n\n_';

    let presenceCount = 0;
    let embed = new MessageEmbed()
      .setTitle(`Sistemas, influencias e estados da ${wingStatus.name}`)
      .setDescription(factionDescription)
      .setColor('#EE0000');

    wingStatus.faction_presence.forEach(presence => {
      presenceCount++;
      const influence = presence.influence * 100;
      let updateAt = formatDistance(new Date(presence.updated_at), new Date(), {
        includeSeconds: true,
        addSuffix: true,
        locale: ptBR,
      });

      const systemName = `${presence.controlledByFaction ? controlledEmoji : iconEmoji} **${presence.system_name}**`;
      updateAt = `\n${pad(capitalize(updateAt), 25, ' ')}➖`;

      const systemTitle = systemName + updateAt;

      let increasedEmoji: GuildEmoji | string = '?';
      if (presence.foundInEdsm) {
        increasedEmoji = presence.influenceIncreased ? increasedUpEmoji : increasedDownEmoji;
      }

      const inf = `Influencia: **${influence.toFixed(1)}%** ${increasedEmoji}`;

      const state = `Estado: __[${formatState(presence.state)}](${presence.system_url})__`;
      const infAndState = `${inf}\n${state}`;

      const activeStates =
        presence.active_states.map(activeState => `${formatState(activeState.state)}`).join('\n>> ') || 'None';
      const lineActivies = `Ativo:\n>> ${activeStates}`;

      const pendingStates =
        presence.pending_states.map(pendingState => `${formatState(pendingState.state)}`).join('\n>> ') || 'None';
      const linePendings = `Pendente:\n>> ${pendingStates}`;

      const description = `${infAndState}\n${lineActivies}\n${linePendings}`;

      embed.addField(systemTitle, description, true);

      if (presenceCount === 18) {
        msg.embed(embed);
        embed = new MessageEmbed().setColor('#EE0000');
      }
    });

    msg.embed(embed);
    msg.react('👍');
    waitMessage.delete();

    return msg.message;
  }
}

export default WingStatusRunner;
