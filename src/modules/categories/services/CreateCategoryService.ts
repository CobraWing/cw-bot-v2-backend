import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  discordId: string;
  name: string;
  description: string;
  enabled: boolean;
  show_in_menu: boolean;
  updated_by: string;
}

@injectable()
class CreateCategoryService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    discordId,
    name,
    description,
    enabled,
    show_in_menu,
    updated_by,
  }: IRequest): Promise<CommandCategory> {
    const server = await this.serversRepository.findByIdDiscord(discordId);

    if (!server) {
      throw new AppError('Server not found');
    }

    const checkCategoryExists = await this.categoriesRepository.findByNameAndServerId(
      name,
      server.id,
    );

    if (checkCategoryExists) {
      throw new AppError('Category already registered');
    }

    const category = await this.categoriesRepository.create({
      server_id: server.id,
      name,
      description,
      enabled,
      show_in_menu,
      updated_by,
    });

    return category;
  }
}

export default CreateCategoryService;
