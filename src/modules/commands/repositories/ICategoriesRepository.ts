import CommandCategory from '../entities/CommandCategory';
import ICreateCategoryDTO from '../dtos/ICreateCategoryDTO';

export default interface ICategoriesRepository {
  findByNameAndServerId(
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined>;

  findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CommandCategory | undefined>;

  create(data: ICreateCategoryDTO): Promise<CommandCategory>;

  update(data: CommandCategory): Promise<CommandCategory>;

  listByServerId(server_id: string): Promise<CommandCategory[] | undefined>;

  getByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CommandCategory | undefined>;

  deleteByIdAndServerId(id: string, server_id: string): Promise<void>;
}
