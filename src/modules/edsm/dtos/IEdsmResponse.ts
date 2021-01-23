interface IEdsmStateResponse {
  state: string;
}

interface IEdsmHistoryResponse {
  [key: string]: number;
}

interface IEdsmFactionResponse {
  name: string;
  influence: string;
  influenceHistory: IEdsmHistoryResponse;
  state: string;
  activeStates: IEdsmStateResponse[];
  pendingStates: IEdsmStateResponse[];
  lastUpdate: string;
}

interface IEdsmControllingFactionResponse {
  name: string;
}

export default interface IEdsmResponse {
  name: string;
  url: string;
  controllingFaction: IEdsmControllingFactionResponse;
  factions: IEdsmFactionResponse[];
}
