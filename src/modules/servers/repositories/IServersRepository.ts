import Server from '../entities/Server';
import ICreateServerDTO from '../dtos/ICreateServerDTO';

export default interface IServersRepository {
  findByIdDiscord(id_discord: string): Promise<Server | undefined>;

  findByIdDiscordAndEnabledServer(
    id_discord: string,
  ): Promise<Server | undefined>;

  findByServerId(server_id: string): Promise<Server | undefined>;

  findAll(enabled: boolean): Promise<Server[] | undefined>;

  create(data: ICreateServerDTO): Promise<Server>;
}
