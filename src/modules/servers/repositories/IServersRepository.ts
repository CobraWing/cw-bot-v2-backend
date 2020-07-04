import Server from '../entities/Server';
import ICreateServerDTO from '../dtos/ICreateServerDTO';

export default interface IServersRepository {
  findByIdDiscord(id_discord: string): Promise<Server | undefined>;

  create(data: ICreateServerDTO): Promise<Server>;
}
