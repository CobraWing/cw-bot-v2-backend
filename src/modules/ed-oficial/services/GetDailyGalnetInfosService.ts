import { injectable } from 'tsyringe';
import axios from 'axios';
import log from 'heroku-logger';
import { StopWatch } from 'stopwatch-node';

import integrationsConfig from '@config/integrationsConfig';
import IGalnetResponse from '../dtos/IGalnetResponse';

interface IRequest {
  formattedDate: string;
}

@injectable()
class GetDailyGalnetInfosService {
  public async execute({ formattedDate }: IRequest): Promise<IGalnetResponse[]> {
    log.debug('[GetDailyGalnetInfosService] Starting to fetch galnet infos');

    const sw = new StopWatch();
    sw.start();

    const { galnetInfosApiUrl } = integrationsConfig.edOficial;

    log.debug(
      `[GetDailyGalnetInfosService] fetch galnet from url ${galnetInfosApiUrl} and filtered for date ${formattedDate}`,
    );

    return new Promise(resolve => {
      try {
        axios
          .get<IGalnetResponse[]>(galnetInfosApiUrl)
          .then(response => {
            sw.stop();
            log.debug(
              `[GetDailyGalnetInfosService] Finish galnet with size ${
                response?.data?.length
              } in ${sw.getTotalTime()}ms`,
            );

            if (response.status !== 200 || response?.data?.length === 0) {
              return [];
            }

            const filteredByDate = response.data.filter(item => item.date === formattedDate);

            log.debug(`[GetDailyGalnetInfosService] filteredByDate with size ${filteredByDate.length}`);

            return resolve(filteredByDate);
          })
          .catch(err => {
            throw new Error(`[GetDailyGalnetInfosService] Error while fetch system by name: ${err?.message}`);
          });
      } catch (err) {
        log.error('[GetDailyGalnetInfosService] Error while fetch galnet infos:', err);
        resolve([]);
      }
    });
  }
}

export default GetDailyGalnetInfosService;
