import { getRepository, Repository } from 'typeorm';

import ICategoriesRepository from '@modules/commands/repositories/ICategoriesRepository';
import ICreateCategoryDTO from '@modules/commands/dtos/ICreateCategoryDTO';

import CommandCategory from '../../entities/CommandCategory';

class CategoriesRepository implements ICategoriesRepository {
  private ormRepository: Repository<CommandCategory>;

  constructor() {
    this.ormRepository = getRepository(CommandCategory);
  }

  public async findByNameAndServerId(
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    const commandCategory = this.ormRepository.findOne({
      where: { name, server_id },
    });

    return commandCategory;
  }

  public async findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    const commandCategory = this.ormRepository.findOne({
      where: { id, server_id },
    });

    return commandCategory;
  }

  public async create(data: ICreateCategoryDTO): Promise<CommandCategory> {
    const commandCategory = this.ormRepository.create(data);

    await this.ormRepository.save(commandCategory);

    return commandCategory;
  }

  public async update(category: CommandCategory): Promise<CommandCategory> {
    const savedCategory = await this.ormRepository.save(category);

    return savedCategory;
  }

  public async listByServerId(
    server_id: string,
  ): Promise<CommandCategory[] | undefined> {
    const categories = await this.ormRepository.find({
      where: { server_id },
    });

    return categories;
  }

  public async getByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    const category = await this.ormRepository.findOne({
      where: { id, server_id },
    });

    return category;
  }

  public async deleteByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<void> {
    await this.ormRepository.delete({
      id,
      server_id,
    });
  }
}

export default CategoriesRepository;
