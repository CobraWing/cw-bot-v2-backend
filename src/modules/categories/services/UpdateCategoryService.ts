import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  categoryId: string;
  discordId: string;
  name: string;
  description: string;
  enabled: boolean;
  show_in_menu: boolean;
  updated_by: string;
}

@injectable()
class UpdateCategoryService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute(data: IRequest): Promise<CommandCategory> {
    const server = await this.serversRepository.findByIdDiscord(data.discordId);

    if (!server) {
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const categoryFound = await this.categoriesRepository.findByIdAndServerId(
      data.categoryId,
      server.id,
    );

    if (!categoryFound) {
      throw new AppError({
        message: 'Category not found.',
        statusCode: 409,
        message_ptbr: 'Categoria não encontrada para atualizar.',
      });
    }

    const categoryNameAlreadyExists = await this.categoriesRepository.findByNotInIdAndNameAndServerId(
      data.categoryId,
      data.name,
      server.id,
    );

    if (categoryNameAlreadyExists) {
      throw new AppError({
        message: 'Category name already exists.',
        statusCode: 409,
        message_ptbr: 'Já existe uma categoria com esse nome.',
      });
    }

    const existsCommandWithSameName = await this.customCommandRepository.findByNameAndServerId(
      data.name,
      server.id,
    );

    if (existsCommandWithSameName) {
      throw new AppError({
        message: 'Exists a custom command with the same name.',
        statusCode: 409,
        message_ptbr: 'Já existe um comando customizado com o mesmo nome.',
      });
    }

    Object.assign(categoryFound, {
      ...data,
    });

    const category = await this.categoriesRepository.update(categoryFound);

    return category;
  }
}

export default UpdateCategoryService;
