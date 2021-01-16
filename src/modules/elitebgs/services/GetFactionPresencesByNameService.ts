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
  foundInEdsm: boolean;
}

interface IEliteBGSDocResponse {
  name: string;
  name_lower: string;
  faction_presence: IEliteBGSFactionsPresenceResponse[];
  numberOfSystems: number;
  numberOfControlledSystems: number;
  lostInfos: boolean;
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

    let factionData = response.data.docs.find(doc => doc.name_lower === factionName);

    if (!factionData) {
      log.error('[GetFactionPresencesByNameService] Faction name not found in response data', factionData);
      throw new Error('Error while faction presence');
    }

    factionData = await this.loadInfosFromEdsm(factionData);

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
    states.set('war', 'War ⚔️');

    return states.get(state) || capitalize(state);
  }

  public loadInfosFromEdsm(factionData: IEliteBGSDocResponse): Promise<IEliteBGSDocResponse> {
    log.info('[GetFactionPresencesByNameService] Starting to get all system infos from edsm');

    const promises: Promise<IEdsmResponse>[] = [];
    factionData.faction_presence.forEach(presence => {
      const { system_name: systemName } = presence;
      promises.push(this.getSystemInfosByNameService.execute({ systemName }));
    });

    return new Promise(resolve => {
      Promise.allSettled(promises)
        .then(data => {
          data
            .filter(p => p.status === 'fulfilled')
            .forEach((result: PromiseSettledResult<IEdsmResponse>) => {
              const systemResult: IEdsmResponse = result.value; // TS bug

              if (!systemResult?.name) {
                factionData.lostInfos = true;
                return;
              }

              const presenceIndex = factionData.faction_presence.findIndex(
                presence => presence.system_name_lower === systemResult.name.toLowerCase(),
              );

              if (presenceIndex < 0) {
                factionData.lostInfos = true;
                return;
              }

              // check system controlled by faction
              const constrolledByFaction = systemResult.controllingFaction.name === factionData.name;
              factionData.faction_presence[presenceIndex].controlledByFaction = constrolledByFaction;
              factionData.faction_presence[presenceIndex].foundInEdsm = true;

              const factionInfosInSystem = systemResult.factions.find(faction => faction.name === factionData.name);

              // check if influence is increased
              if (factionInfosInSystem) {
                const influences = Object.values(factionInfosInSystem.influenceHistory);
                const lastIndex = influences.length - 1;
                const penultimateIndex = influences.length - 2;
                const influenceIncreased = influences[lastIndex] >= influences[penultimateIndex];

                factionData.faction_presence[presenceIndex].influenceIncreased = influenceIncreased;
                factionData.faction_presence[presenceIndex].influence = influences[lastIndex];
              }

              factionData.faction_presence[presenceIndex].system_url = systemResult.url;
            });
        })
        .catch(err => {
          factionData.lostInfos = true;
          log.error('[GetFactionPresencesByNameService] Error while fetch infos from edsm', err);
        })
        .finally(() => {
          log.info('[GetFactionPresencesByNameService] Finish get all system infos from edsm');
          resolve(factionData);
        });
    });
  }
}

export default GetFactionPresencesByNameService;
