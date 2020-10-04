import DefaultCommand from '../entities/DefaultCommand';

export default interface IDefaultCommandRepository {
  findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<DefaultCommand | undefined>;
}
