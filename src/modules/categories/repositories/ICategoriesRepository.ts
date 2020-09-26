import CommandCategory from '../entities/CommandCategory';
import ICreateCategoryDTO from '../dtos/ICreateCategoryDTO';

export default interface ICategoriesRepository {
  findByNameAndServerId(
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined>;

  findByNotInIdAndNameAndServerId(
    id: string,
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

  listEnabledByServerIdAndEnableCustomCommand(
    server_id: string,
    show_in_menu?: boolean,
  ): Promise<CommandCategory[] | undefined>;

  deleteByIdAndServerId(id: string, server_id: string): Promise<void>;

  getCategoryByNameAndServerIdAndListCommandsEnabled(
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined>;
}
