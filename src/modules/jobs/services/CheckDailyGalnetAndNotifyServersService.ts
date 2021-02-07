/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */

import { injectable, inject, container } from 'tsyringe';
import log from 'heroku-logger';
import { addYears, subDays } from 'date-fns';
import { format } from 'date-fns-tz';
import { Guild, GuildChannel, MessageEmbed, TextChannel } from 'discord.js';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import GetDailyGalnetInfosService from '@modules/ed-oficial/services/GetDailyGalnetInfosService';
import IGalnetResponse from '@modules/ed-oficial/dtos/IGalnetResponse';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICacheProvider from '@shared/providers/CacheProvider/models/ICacheProvider';
import serverConfig from '@config/serverConfig';

interface IGuildToNotificate {
  guild: Guild;
  channel: GuildChannel;
}

@injectable()
class CheckDailyGalnetAndNotifyServersService {
  private getDailyGalnetInfosService: GetDailyGalnetInfosService;

  constructor(
    @inject('CacheProvider')
    private cachProvider: ICacheProvider,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {
    this.getDailyGalnetInfosService = container.resolve(GetDailyGalnetInfosService);
  }

  public async execute(): Promise<void> {
    try {
      const eventsDate = addYears(new Date(), 1286);
      const eventsDateFormatted = format(eventsDate, 'dd MMM yyyy').toUpperCase();
      const cacheKey = `galnet-${format(eventsDate, 'dd-MMM-yyyy').toUpperCase()}`;

      // get today galnet events
      const actualGalnetEvents = await this.getDailyGalnetInfosService.execute({ formattedDate: eventsDateFormatted });

      if (!actualGalnetEvents || actualGalnetEvents.length === 0) return;

      // get events already sent
      const recordedLastGalnetEvents = await this.cachProvider.recovery<IGalnetResponse[]>(cacheKey);

      // which should be sent
      const eventsToSendNotification = this.eventsToSendNotification(actualGalnetEvents, recordedLastGalnetEvents);

      if (!eventsToSendNotification) return;

      // check guilds to notify
      const guildToNotificate = await this.getGuildsToNotify();

      if (guildToNotificate.length === 0) return;

      // create messages to send
      const messagesToNotify = this.getMessageToNotify(eventsToSendNotification);

      // send notifications to all servers
      this.sendNotifications(messagesToNotify, guildToNotificate);

      // save in cache sent messages
      const allEventsSent = [...eventsToSendNotification];
      if (recordedLastGalnetEvents) {
        allEventsSent.push(...recordedLastGalnetEvents);
      }
      this.cachProvider.save(cacheKey, allEventsSent);

      // remove last day cache
      const lastDayCacheKey = `galnet-${format(subDays(eventsDate, 1), 'dd-MMM-yyyy').toUpperCase()}`;
      this.cachProvider.invalidate(lastDayCacheKey);
    } catch (err) {
      log.error('[CheckDailyGalnetAndNotifyServersService] error:', [err.message, err.stack]);
    }
  }

  private eventsToSendNotification(
    actualGalnetEvents: IGalnetResponse[],
    recordedLastGalnetEvents: IGalnetResponse[] | null,
  ): IGalnetResponse[] | undefined {
    if (!recordedLastGalnetEvents) {
      return actualGalnetEvents;
    }

    const eventsToSend = [] as IGalnetResponse[];

    actualGalnetEvents.forEach(item => {
      const foundItem = recordedLastGalnetEvents.find(recorded => recorded.slug === item.slug);
      if (!foundItem) {
        eventsToSend.push(item);
      }
    });

    return eventsToSend.length > 0 ? eventsToSend : undefined;
  }

  private async getGuildsToNotify(): Promise<IGuildToNotificate[]> {
    const commandoClient = await container.resolve(ClientProvider).getCLient();
    const guildsToNotificate: IGuildToNotificate[] = [];

    const { key } = serverConfig.galnet_notification_channel;

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

  private getMessageToNotify(actualGalnetEvents: IGalnetResponse[]): MessageEmbed[] {
    const embeds = [] as MessageEmbed[];

    actualGalnetEvents.forEach(item => {
      const [image, thumb] = item.image.split(',');

      const body = item.body
        .replace(/<p>|<\/p>/g, '')
        .replace(/\*/g, '**')
        .replace(/<br \/>|<br\/>/g, '\n');

      const embed = new MessageEmbed()
        .setTitle(`${item.date} - ${item.title}`)
        .setDescription(body)
        .setImage(image ? `https://hosting.zaonce.net/elite-dangerous/galnet/${image}.png` : '')
        .setThumbnail(
          thumb ? `https://hosting.zaonce.net/elite-dangerous/galnet/${thumb}.png` : 'https://i.imgur.com/Ig6OgUj.png',
        )
        .setColor('#EE0000')
        .setFooter(`#${item.nid}`)
        .setTimestamp(new Date());

      embeds.push(embed);
    });

    return embeds;
  }

  private async sendNotifications(embeds: MessageEmbed[], guildList: IGuildToNotificate[]): Promise<void> {
    for (const itemList of guildList) {
      log.info(
        `[CheckLastTickAndNotifyServersService] Sending ${embeds.length} notifications to ${itemList.channel.name} in ${itemList.guild.name}`,
      );
      embeds.forEach(embed => {
        const textChannel = itemList.channel as TextChannel;
        textChannel.send(embed);
      });
    }
  }
}

export default CheckDailyGalnetAndNotifyServersService;
