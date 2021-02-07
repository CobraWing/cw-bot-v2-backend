import { injectable } from 'tsyringe';
import axios from 'axios';
import log from 'heroku-logger';
import { StopWatch } from 'stopwatch-node';

import integrationsConfig from '@config/integrationsConfig';
import IEdsmResponse from '../dtos/IEdsmResponse';

interface IRequest {
  systemName: string;
}

@injectable()
class GetSystemInfosByNameService {
  public async execute({ systemName }: IRequest): Promise<IEdsmResponse> {
    log.info(`[GetSystemInfosByNameService] Starting to fetch system by name ${systemName}`);

    const sw = new StopWatch();
    sw.start();

    const { systemByNameApiUrl } = integrationsConfig.edsm;
    const systemNameFormatted = systemName.toLowerCase().replace(/ /g, '%20').replace(/\+/g, '%2B');
    const requestUrl = systemByNameApiUrl.replace(/<SYSTEM_NAME>/g, systemNameFormatted);

    log.debug(`[GetSystemInfosByNameService] fetch system from ${requestUrl}`);

    return new Promise((resolve, reject) => {
      axios
        .get<IEdsmResponse>(requestUrl)
        .then(response => {
          sw.stop();
          log.debug(`[GetSystemInfosByNameService] Finish fetch system ${systemName} in ${sw.getTotalTime()}ms`);
          resolve(response.data);
        })
        .catch(err => {
          log.error('[GetSystemInfosByNameService] Error while fetch system by name', [err.message, err.stack]);
          reject();
        });
    });
  }
}

export default GetSystemInfosByNameService;
