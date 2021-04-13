const eliteBGSApiUrl = 'https://elitebgs.app/api/ebgs/v5';
const edsmApiUrl = 'https://www.edsm.net';
const edOficialCMSApiUrl = 'https://cms.elitedangerous.com/api';

const integrationsConfig = {
  eliteBGS: {
    factionsByNameApiUrl: `${eliteBGSApiUrl}/factions?name=<FACTION_NAME>`,
    tickApiUrl: `${eliteBGSApiUrl}/ticks`,
  },
  edsm: {
    systemByNameApiUrl: `${edsmApiUrl}/api-system-v1/factions?systemName=<SYSTEM_NAME>&showHistory=1`,
  },
  edOficial: {
    galnetInfosApiUrl: `${edOficialCMSApiUrl}/galnet?_format=json`,
  },
};

export default integrationsConfig;
