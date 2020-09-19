import CustomCommand from '../entities/CustomCommand';
import ICreateCustomCommandDTO from '../dtos/ICreateCustomCommandDTO';

export default interface ICustomCommandRepository {
  findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CustomCommand | undefined>;

  findByNameAndServerId(
    name: string,
    server_id: string,
  ): Promise<CustomCommand | undefined>;

  findByNotInIdAndNameAndServerId(
    id: string,
    name: string,
    server_id: string,
  ): Promise<CustomCommand | undefined>;

  create(data: ICreateCustomCommandDTO): Promise<CustomCommand>;

  update(data: CustomCommand): Promise<CustomCommand>;

  listByServerId(server_id: string): Promise<CustomCommand[] | undefined>;

  listEnabledByServerId(
    server_id: string,
  ): Promise<CustomCommand[] | undefined>;

  deleteByIdAndServerId(id: string, server_id: string): Promise<void>;

  countByCategoryId(category_id: string): Promise<[CustomCommand[], number]>;
}
