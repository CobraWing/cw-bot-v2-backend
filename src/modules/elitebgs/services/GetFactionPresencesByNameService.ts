/* eslint-disable no-param-reassign */
import { injectable, container } from 'tsyringe';
import axios from 'axios';
import log from 'heroku-logger';
import capitalize from 'capitalize';
import { StopWatch } from 'stopwatch-node';

import integrationsConfig from '@config/integrationsConfig';

import GetSystemInfosByNameService from '@modules/edsm/services/GetSystemInfosByNameService';
import IEdsmResponse from '@modules/edsm/dtos/IEdsmResponse';

interface IEliteBGSConflictResponse {
  type: string;
  status: string;
  opponent_name: string;
  opponent_name_lower: string;
  stake: string;
  stake_lower: string;
  days_won: number;
}

interface IEliteBGSStatesResponse {
  state: string;
  trend: number;
  state_formatted: Function;
}

interface IEliteBGSFactionsPresenceResponse {
  system_name: string;
  system_name_lower: string;
  system_url: string;
  state: string;
  influence: number;
  happiness: string;
  active_states: IEliteBGSStatesResponse[];
  pending_states: IEliteBGSStatesResponse[];
  recovering_states: IEliteBGSStatesResponse[];
  conflicts: IEliteBGSConflictResponse[];
  updated_at: string;
  controlledByFaction: boolean;
  influenceIncreased: boolean;
}

interface IEliteBGSDocResponse {
  name: string;
  name_lower: string;
  faction_presence: IEliteBGSFactionsPresenceResponse[];
  numberOfSystems: number;
  numberOfControlledSystems: number;
}

interface IEliteBGSResponse {
  docs: IEliteBGSDocResponse[];
}

interface IRequest {
  factionName: string;
}

@injectable()
class GetFactionPresencesByNameService {
  private getSystemInfosByNameService: GetSystemInfosByNameService;

  constructor() {
    this.getSystemInfosByNameService = container.resolve(GetSystemInfosByNameService);
  }

  public async execute({ factionName }: IRequest): Promise<IEliteBGSDocResponse> {
    log.info(`[GetFactionPresencesByNameService] Starting to fetch factions for ${factionName}`);
    const sw = new StopWatch();
    sw.start();

    const { factionsByNameApiUrl } = integrationsConfig.eliteBGS;
    const requestUrl = factionsByNameApiUrl.replace(/<FACTION_NAME>/g, factionName).replace(/ /g, '%20');

    log.debug(`[GetFactionPresencesByNameService] fetch factions from ${requestUrl}`);

    const response = await axios.get<IEliteBGSResponse>(requestUrl);

    if (response?.status !== 200 || !response?.data?.docs) {
      log.error('[GetFactionPresencesByNameService] Error while get faction presences', response);
      throw new Error('Error while faction presence');
    }

    const factionData = response.data.docs.find(doc => doc.name_lower === factionName);

    if (!factionData) {
      log.error('[GetFactionPresencesByNameService] Faction name not found in response data', factionData);
      throw new Error('Error while faction presence');
    }

    factionData.faction_presence = await this.loadInfosFromEdsm(factionData.faction_presence, factionData.name);

    // log.info('systems', factionData.faction_presence);

    factionData.faction_presence.sort((a, b) => (a.influence < b.influence ? 1 : -1));

    sw.stop();
    log.info(
      `[GetFactionPresencesByNameService] Finish fetch factions in ${sw.getTotalTime()}ms, with size: ${
        factionData.faction_presence.length
      }`,
    );

    return factionData;
  }

  public formatState(state: string): string {
    const states = new Map();
    states.set('infrastructurefailure', 'Infrastructure Failure');

    return states.get(state) || capitalize(state);
  }

  public loadInfosFromEdsm(
    factionPresences: IEliteBGSFactionsPresenceResponse[],
    factionName: string,
  ): Promise<IEliteBGSFactionsPresenceResponse[]> {
    log.info('[GetFactionPresencesByNameService] Starting to get all system infos from edsm');

    const promises: Promise<IEdsmResponse>[] = [];
    factionPresences.forEach(presence => {
      const { system_name: systemName } = presence;
      promises.push(this.getSystemInfosByNameService.execute({ systemName }));
    });

    return new Promise(resolve => {
      Promise.all(promises)
        .then((results: IEdsmResponse[]) => {
          // for each system
          results.forEach(systemResult => {
            const presenceIndex = factionPresences.findIndex(
              presence => presence.system_name_lower === systemResult.name.toLowerCase(),
            );

            // check system controlled by faction
            const constrolledByFaction = systemResult.controllingFaction.name === factionName;
            factionPresences[presenceIndex].controlledByFaction = constrolledByFaction;

            const factionInfosInSystem = systemResult.factions.find(faction => faction.name === factionName);

            // check if influence is increased
            if (factionInfosInSystem) {
              const influences = Object.values(factionInfosInSystem.influenceHistory);
              const lastIndex = influences.length - 1;
              const penultimateIndex = influences.length - 2;
              const influenceIncreased = influences[lastIndex] >= influences[penultimateIndex];

              factionPresences[presenceIndex].influenceIncreased = influenceIncreased;
              factionPresences[presenceIndex].influence = influences[lastIndex];
            }

            factionPresences[presenceIndex].system_url = systemResult.url;
          });
        })
        .catch(err => {
          log.error('[GetFactionPresencesByNameService] Error while fetch infos from edsm', err);
        })
        .finally(() => {
          log.info('[GetFactionPresencesByNameService] Finish get all system infos from edsm');
          resolve(factionPresences);
        });
    });
  }
}

export default GetFactionPresencesByNameService;
