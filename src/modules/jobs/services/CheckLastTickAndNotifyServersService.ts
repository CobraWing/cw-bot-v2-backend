/* eslint-disable no-param-reassign */
import { injectable, inject, container } from 'tsyringe';
import log from 'heroku-logger';
import { isEqual, isBefore } from 'date-fns';
import { Guild } from 'discord.js';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import GetLastTickService from '@modules/elitebgs/services/GetLastTickService';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICacheProvider from '@shared/providers/CacheProvider/models/ICacheProvider';
import serverConfig from '@config/serverConfig';

interface IGuildToNotificate {
  guild: Guild;
  channel: string;
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

      const guildToNotificate = await this.getGuildsToNotify();

      log.info('test', { actualLastTick, recordedLastTick });
    } catch (e) {
      log.error('[CheckLastTickAndNotifyServersService] error:', e);
    }
  }

  private skipSendNotification(actualLastTick: ITick, recordedLastTick: ITick | null): boolean {
    if (!recordedLastTick) {
      return false;
    }

    const actuakLastTickDate = new Date(actualLastTick.updated_at);
    const recordedLastTickDate = new Date(recordedLastTick.updated_at);

    return !isEqual(actuakLastTickDate, recordedLastTickDate) && isBefore(actuakLastTickDate, recordedLastTickDate);
  }

  private async getGuildsToNotify(): Promise<IGuildToNotificate[]> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();
    const guildsToNotificate: IGuildToNotificate[] = [];

    const { key } = serverConfig.tick_notification_channel;

    commandoClient.guilds.cache
      .filter(guild => guild.available)
      .map(guild => guild.id)
      .forEach(async discord_id => {
        const server = await this.serversRepository.findByIdDiscord(discord_id);

        if (server && server.getConfiguration(key)) {
          const guildToNotificate: IGuildToNotificate = {
            guild: commandoClient.guilds.cache.find(guild => guild.id === discord_id) || ({} as Guild),
            channel: server.getConfiguration(key) || '',
          };

          guildsToNotificate.push(guildToNotificate);
        }
      });

    return guildsToNotificate;
  }
}

export default CheckLastTickAndNotifyServersService;
