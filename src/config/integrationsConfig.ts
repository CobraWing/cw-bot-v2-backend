const eliteBGSApiUrl = 'https://elitebgs.app/api/ebgs/v4';
const edsmApiUrl = 'https://www.edsm.net';

const integrationsConfig = {
  eliteBGS: {
    factionsByNameApiUrl: `${eliteBGSApiUrl}/factions?name=<FACTION_NAME>`,
  },
  edsm: {
    systemByNameApiUrl: `${edsmApiUrl}/api-system-v1/factions?systemName=<SYSTEM_NAME>&showHistory=1`,
  },
};

export default integrationsConfig;
