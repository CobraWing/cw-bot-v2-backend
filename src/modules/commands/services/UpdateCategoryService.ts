import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  categoryId: string;
  discordId: string;
  name: string;
  description: string;
  enabled: boolean;
  show_in_menu: boolean;
}

@injectable()
class UpdateCategoryService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute(data: IRequest): Promise<CommandCategory> {
    const server = await this.serversRepository.findByIdDiscord(data.discordId);

    if (!server) {
      throw new AppError('Server not found');
    }

    const categoryFound = await this.categoriesRepository.findByIdAndServerId(
      data.categoryId,
      server.id,
    );

    if (!categoryFound) {
      throw new AppError('Category not found');
    }

    Object.assign(categoryFound, {
      ...data,
    });

    const category = await this.categoriesRepository.update(categoryFound);

    return category;
  }
}

export default UpdateCategoryService;
