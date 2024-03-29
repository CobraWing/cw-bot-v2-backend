import { injectable, inject, container, delay } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import RegisterCustomsProvider from '@modules/discord/providers/RegisterCustomsProvider';
import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import CommandCategory from '../entities/CommandCategory';
import CategoriesRepository from '../repositories/typeorm/CategoriesRepository';
import CustomCommandRepository from '@modules/commands/repositories/typeorm/CustomCommandRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

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
  private registerCustomsProvider: RegisterCustomsProvider;

  constructor(
    @inject(delay(() => CategoriesRepository))
    private categoriesRepository: ICategoriesRepository,
    @inject(delay(() => CustomCommandRepository))
    private customCommandRepository: ICustomCommandRepository,
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {
    this.registerCustomsProvider = container.resolve(RegisterCustomsProvider);
  }

  public async execute(data: IRequest): Promise<CommandCategory> {
    const server = await this.serversRepository.findByIdDiscord(data.discordId);

    if (!server) {
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const categoryFound = await this.categoriesRepository.findByIdAndServerId(data.categoryId, server.id);

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
        message_ptbr: 'Já existe uma outra categoria com o mesmo nome, escolha um nome diferente.',
      });
    }

    const existsCommandWithSameName = await this.customCommandRepository.findByNameAndServerId(data.name, server.id);

    if (existsCommandWithSameName) {
      throw new AppError({
        message: 'Exists a custom command with the same name.',
        statusCode: 409,
        message_ptbr: 'Já existe um comando customizado com o mesmo nome, escolha um nome diferente.',
      });
    }

    Object.assign(categoryFound, {
      ...data,
    });

    const category = await this.categoriesRepository.update(categoryFound);

    this.registerCustomsProvider.execute();

    return category;
  }
}

export default UpdateCategoryService;
