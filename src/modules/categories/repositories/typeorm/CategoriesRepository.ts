import { getRepository, Repository, Not } from 'typeorm';

import ICategoriesRepository from '@modules/categories/repositories/ICategoriesRepository';
import ICreateCategoryDTO from '@modules/categories/dtos/ICreateCategoryDTO';

import CustomCommand from '@modules/commands/entities/CustomCommand';
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

  public async findByNotInIdAndNameAndServerId(
    id: string,
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    const commandCategory = this.ormRepository.findOne({
      where: {
        id: Not(id),
        name,
        server_id,
      },
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

  public async deleteByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<void> {
    await this.ormRepository.delete({
      id,
      server_id,
    });
  }

  public async listEnabledByServerIdAndEnableCustomCommand(
    server_id: string,
    show_in_menu?: boolean,
  ): Promise<CommandCategory[] | undefined> {
    const query = this.ormRepository
      .createQueryBuilder('command_categories')
      .innerJoinAndSelect(
        CustomCommand,
        'customCommands',
        'customCommands.category_id = command_categories.id',
      )
      .where('command_categories.server_id = :server_id', {
        server_id,
      })
      .andWhere('command_categories.enabled = true')
      .andWhere('customCommands.enabled = true');

    if (show_in_menu) {
      query.andWhere('command_categories.show_in_menu = :show_in_menu', {
        show_in_menu,
      });
      query.andWhere('customCommands.show_in_menu = :show_in_menu', {
        show_in_menu,
      });
    }

    query.orderBy('command_categories.name', 'ASC');

    const categoriesEnabled = await query.getMany();

    return categoriesEnabled;
  }

  public async getCategoryByNameAndServerIdAndListCommandsEnabled(
    name: string,
    server_id: string,
  ): Promise<CommandCategory | undefined> {
    const category = await this.ormRepository
      .createQueryBuilder('command_categories')
      .leftJoinAndSelect(
        'command_categories.customCommands',
        'customCommands',
        'customCommands.category_id = command_categories.id',
      )
      .where('command_categories.server_id = :server_id', {
        server_id,
      })
      .where('command_categories.name = :name', {
        name,
      })
      .andWhere('customCommands.enabled = true')
      .andWhere('customCommands.show_in_menu = true')
      .orderBy('customCommands.name', 'ASC')
      .getOne();

    return category;
  }
}

export default CategoriesRepository;
