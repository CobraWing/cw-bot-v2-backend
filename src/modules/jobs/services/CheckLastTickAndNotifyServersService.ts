/* eslint-disable no-param-reassign */
import { injectable, inject, container } from 'tsyringe';
import log from 'heroku-logger';
import { isAfter } from 'date-fns';

import ClientProvider from '@modules/discord/providers/ClientProvider';
import GetLastTickService from '@modules/elitebgs/services/GetLastTickService';
import ICacheProvider from '@shared/providers/CacheProvider/models/ICacheProvider';

interface ITick {
  _id: string;
  time: string;
  updated_at: string;
}

@injectable()
class CheckLastTickAndNotifyServersService {
  private clientProvider: ClientProvider;

  private getLastTickService: GetLastTickService;

  constructor(
    @inject('CacheProvider')
    private cachProvider: ICacheProvider,
  ) {
    this.clientProvider = container.resolve(ClientProvider);
    this.getLastTickService = container.resolve(GetLastTickService);
  }

  public async execute(): Promise<void> {
    try {
      log.debug('[CheckLastTickAndNotifyServersService] Starting to fetch last tick');

      const getlastTickResponseNow = await this.getLastTickService.execute();

      if (!getlastTickResponseNow) return;

      // console.log(lastTickResponse);
      const lastTickRecorded = await this.cachProvider.recovery<ITick>('last-tick');

      if (
        !lastTickRecorded ||
        isAfter(new Date(getlastTickResponseNow.updated_at), new Date(lastTickRecorded.updated_at))
      ) {
        log.info('test', { getlastTickResponseNow, lastTickRecorded });
      }
    } catch (e) {
      log.error('[CheckLastTickAndNotifyServersService] error:', e);
    }
  }
}

export default CheckLastTickAndNotifyServersService;
