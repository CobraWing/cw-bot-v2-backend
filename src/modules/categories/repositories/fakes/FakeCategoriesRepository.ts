import { uuid } from 'uuidv4';

import ICategoriesRepository from '@modules/categories/repositories/ICategoriesRepository';
import ICreateCategoryDTO from '@modules/categories/dtos/ICreateCategoryDTO';

import CommandCategory from '../../entities/CommandCategory';

class FakeCategoriesRepository implements ICategoriesRepository {
  private categories: CommandCategory[] = [];

  public async findByNameAndServerId(
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    return this.categories.find(
      category => category.name === name && category.server_id === server_id,
    );
  }

  public async findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    return this.categories.find(
      category => category.id === id && category.server_id === server_id,
    );
  }

  public async findByNotInIdAndNameAndServerId(
    id: string,
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    return this.categories.find(
      category =>
        category.id !== id &&
        category.name === name &&
        category.server_id === server_id,
    );
  }

  public async create(data: ICreateCategoryDTO): Promise<CommandCategory> {
    const category = new CommandCategory();

    Object.assign(category, { id: uuid() }, data);

    this.categories.push(category);

    return category;
  }

  public async update(data: CommandCategory): Promise<CommandCategory> {
    const categoryIndex = this.categories.findIndex(
      category => category.id === data.id,
    );

    this.categories[categoryIndex] = data;

    return data;
  }

  public async listByServerId(
    server_id: string,
  ): Promise<CommandCategory[] | undefined> {
    const categories = this.categories.filter(
      category => category.server_id === server_id,
    );

    return categories;
  }

  public async deleteByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<void> {
    const categoryIndex = this.categories.findIndex(
      category => category.id === id && category.server_id === server_id,
    );

    this.categories.splice(categoryIndex, 1);
  }

  public async listEnabledByServerIdAndEnableCustomCommand(
    server_id: string,
    show_in_menu: boolean,
  ): Promise<CommandCategory[] | undefined> {
    const categories = this.categories.filter(
      category =>
        category.server_id === server_id &&
        category.enabled === true &&
        category.customCommands.filter(
          customCommands => customCommands.enabled === true,
        ).length > 0,
    );

    return categories;
  }
}

export default FakeCategoriesRepository;
