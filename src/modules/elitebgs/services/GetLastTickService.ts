/* eslint-disable no-param-reassign */
import { injectable } from 'tsyringe';
import axios from 'axios';
import log from 'heroku-logger';
import { StopWatch } from 'stopwatch-node';

import integrationsConfig from '@config/integrationsConfig';

interface ITick {
  _id: string;
  time: string;
  updated_at: string;
}

@injectable()
class GetLastTickService {
  public async execute(): Promise<ITick | undefined> {
    log.debug('[GetLastTickService] Starting to fetch last tick');
    const sw = new StopWatch();
    sw.start();

    const { tickApiUrl } = integrationsConfig.eliteBGS;

    log.debug(`[GetLastTickService] fetch factions from ${tickApiUrl}`);

    const response = await axios.get<ITick[]>(tickApiUrl);

    sw.stop();

    if (response?.status !== 200 || response?.data?.length === 0) {
      log.error('[GetLastTickService] Error while check last tick', response?.data);
      throw new Error('Error while check last tick');
    }

    log.debug(`[GetLastTickService] Finish fetch in ${sw.getTotalTime()}ms `);

    return response.data.pop();
  }
}

export default GetLastTickService;
