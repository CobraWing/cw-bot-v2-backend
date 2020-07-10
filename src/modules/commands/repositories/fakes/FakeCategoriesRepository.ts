import { uuid } from 'uuidv4';

import ICategoriesRepository from '@modules/commands/repositories/ICategoriesRepository';
import ICreateCategoryDTO from '@modules/commands/dtos/ICreateCategoryDTO';

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

  public async create(data: ICreateCategoryDTO): Promise<CommandCategory> {
    const category = new CommandCategory();

    Object.assign(category, { id: uuid() }, data);

    this.categories.push(category);

    return category;
  }
}

export default FakeCategoriesRepository;
