/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
import { injectable, inject, container } from 'tsyringe';
import log from 'heroku-logger';
import { isEqual, isAfter, formatDistanceToNow, subHours } from 'date-fns';
import { format, toDate } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { Guild, GuildChannel, TextChannel } from 'discord.js';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import GetLastTickService from '@modules/elitebgs/services/GetLastTickService';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICacheProvider from '@shared/providers/CacheProvider/models/ICacheProvider';
import serverConfig from '@config/serverConfig';

interface IGuildToNotificate {
  guild: Guild;
  channel: GuildChannel;
}

interface ITick {
  _id: string;
  time: string;
  updated_at: string;
}

@injectable()
class CheckLastTickAndNotifyServersService {
  private getLastTickService: GetLastTickService;

  constructor(
    @inject('CacheProvider')
    private cachProvider: ICacheProvider,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {
    this.getLastTickService = container.resolve(GetLastTickService);
  }

  public async execute(): Promise<void> {
    try {
      log.debug('[CheckLastTickAndNotifyServersService] Starting to fetch last tick');

      const actualLastTick = await this.getLastTickService.execute();

      if (!actualLastTick) throw new Error('');

      const recordedLastTick = await this.cachProvider.recovery<ITick>('last-tick');

      if (this.skipSendNotification(actualLastTick, recordedLastTick)) {
        return;
      }

      await this.cachProvider.save('last-tick', actualLastTick);

      const guildToNotificate = await this.getGuildsToNotify();

      if (guildToNotificate.length === 0) {
        return;
      }

      const messageToNotify = this.getMessageToNotify(actualLastTick);

      await this.sendNotification(messageToNotify, guildToNotificate);
    } catch (err) {
      log.error('[CheckLastTickAndNotifyServersService] error:', [err.message, err.stack]);
    }
  }

  private skipSendNotification(actualLastTick: ITick, recordedLastTick: ITick | null): boolean {
    if (!recordedLastTick) {
      return false;
    }

    const actuakLastTickDate = new Date(actualLastTick.time);
    const recordedLastTickDate = new Date(recordedLastTick.time);

    return isEqual(actuakLastTickDate, recordedLastTickDate) || !isAfter(actuakLastTickDate, recordedLastTickDate);
  }

  private async getGuildsToNotify(): Promise<IGuildToNotificate[]> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();
    const guildsToNotificate: IGuildToNotificate[] = [];

    const { key } = serverConfig.tick_notification_channel;

    const guildIds = commandoClient.guilds.cache.filter(guild => guild.available).map(guild => guild.id);

    for (const discord_id of guildIds) {
      const server = await this.serversRepository.findByIdDiscord(discord_id);

      if (server && server.getConfiguration(key)) {
        const guild = commandoClient.guilds.cache.find(g => g.id === discord_id);
        const channel = guild?.channels.cache.find(c => c.name === server.getConfiguration(key));

        if (guild && channel && channel.isText()) {
          guildsToNotificate.push({
            guild,
            channel,
          });
        }
      }
    }

    return guildsToNotificate;
  }

  private getMessageToNotify(actualLastTick: ITick): string {
    const tickDate = toDate(actualLastTick.time);
    const lastTickWas = formatDistanceToNow(tickDate, {
      addSuffix: true,
      locale: ptBR,
    });

    const dateFormatted = format(subHours(tickDate, 3), 'dd/MM/yyyy HH:mm');

    return `‼️ **NOTIFICAÇÃO:** ‼️\nO último tick aconteceu **${lastTickWas} em ${dateFormatted} (horário do Brasil)**`;
  }

  private async sendNotification(message: string, guildList: IGuildToNotificate[]): Promise<void> {
    for (const itemList of guildList) {
      log.info(
        `[CheckLastTickAndNotifyServersService] Sending notification to ${itemList.channel.name} in ${itemList.guild.name}`,
      );
      const textChannel = itemList.channel as TextChannel;
      await textChannel.send(message);
    }
  }
}

export default CheckLastTickAndNotifyServersService;
