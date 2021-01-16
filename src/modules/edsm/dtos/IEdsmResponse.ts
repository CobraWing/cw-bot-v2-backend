interface IEdsmInfluenceHistoryResponse {
  [key: string]: number;
}

interface IEdsmFactionResponse {
  name: string;
  influence: string;
  influenceHistory: IEdsmInfluenceHistoryResponse;
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
