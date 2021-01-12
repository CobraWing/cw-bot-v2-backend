/* eslint-disable no-new-wrappers */
/* eslint-disable no-plusplus */
import { container } from 'tsyringe';
import { Message, MessageEmbed } from 'discord.js';
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
    msg.react('⏳');

    const server = await this.findEnabledServerByDiscordId.execute({
      discord_id,
    });

    if (!server) {
      log.error(`server id ${discord_id} is not found or enabled`);
      return msg.message; // TODO: Mensagem de erro
    }

    const { key: keyToggle } = serverConfig.wing_status_command_enabled;
    const { key: keyWingName } = serverConfig.wing_status_command_wing_name;

    const factionName = server.getConfiguration(keyWingName);
    const commandEnabled = server.getConfiguration(keyToggle) === 'true';

    if (!commandEnabled || !factionName) {
      log.error(`command ${keyToggle} is not enabled or setupped`);
      return msg.message; // TODO: Mensagem de erro
    }

    const wingStatus = await this.getFactionPresencesByNameService.execute({
      factionName,
    });

    const { formatState } = this.getFactionPresencesByNameService;

    const iconEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'orangeicon') || '👑';
    const controlledEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'cwlogo') || '👑';
    let increasedUpEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'up') || '🟢';
    let increasedDownEmoji = msg.guild.emojis.cache.find(emoji => emoji.name === 'down') || '🔴';

    const numberOfSystems = wingStatus.faction_presence.length;
    const numberOfControlledSystems = wingStatus.faction_presence.filter(
      presence => presence.controlledByFaction === true,
    ).length;
    const namesOfConflictsSystems = wingStatus.faction_presence
      .filter(presence => presence.conflicts.length > 0)
      .map(presence => `**${presence.system_name}**`);
    const numberOfConflictsSystems = namesOfConflictsSystems.length;

    const incompletedInfos = wingStatus.lostInfos;
    if (incompletedInfos) {
      increasedUpEmoji = '';
      increasedDownEmoji = '';
    }

    let factionDescription = `${iconEmoji} Total de sistemas: **${numberOfSystems}**\n`;

    factionDescription += `⚔️ Sistemas em conflito: **${numberOfConflictsSystems}** - (${namesOfConflictsSystems.join(
      ', ',
    )})\n`;

    if (incompletedInfos) {
      factionDescription += '⚠️ Algumas informações estão incompletas por indisponibilidades de sistemas.';
    } else {
      factionDescription += `${controlledEmoji} Sistemas controlados: **${numberOfControlledSystems}**\n`;
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

      const systemName = `${presence.controlledByFaction ? controlledEmoji : ''} **${presence.system_name}**`;
      updateAt = `\n${pad(capitalize(updateAt), 25, ' ')}➖`;

      const systemTitle = systemName + updateAt;
      const increasedEmoji = presence.influenceIncreased ? increasedUpEmoji : increasedDownEmoji;

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

    return msg.message;
  }
}

export default WingStatusRunner;
