import CommandCategory from '../entities/CommandCategory';
import ICreateCategoryDTO from '../dtos/ICreateCategoryDTO';

export default interface ICategoriesRepository {
  findByNameAndServerId(
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined>;

  create(data: ICreateCategoryDTO): Promise<CommandCategory>;

  listByServerId(server_id: string): Promise<CommandCategory[] | undefined>;
}
