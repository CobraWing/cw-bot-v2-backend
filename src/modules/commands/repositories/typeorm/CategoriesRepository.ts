import { getRepository, Repository } from 'typeorm';

import ICategoriesRepository from '@modules/commands/repositories/ICategoriesRepository';
import ICreateCategoryDTO from '@modules/commands/dtos/ICreateCategoryDTO';

import CommandCategory from '../../entities/CommandCategory';

class CategoriesRepository implements ICategoriesRepository {
  private ormRepository: Repository<CommandCategory>;

  constructor() {
    this.ormRepository = getRepository(CommandCategory);
  }

  public async create(data: ICreateCategoryDTO): Promise<CommandCategory> {
    const commandCategory = this.ormRepository.create(data);

    await this.ormRepository.save(commandCategory);

    return commandCategory;
  }
}

export default CategoriesRepository;
