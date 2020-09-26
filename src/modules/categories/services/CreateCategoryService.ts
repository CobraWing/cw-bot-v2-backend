import { injectable, inject, container } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import RegisterCustomsProvider from '@modules/discord/providers/RegisterCustomsProvider';
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
  private registerCustoms: RegisterCustomsProvider;

  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {
    this.registerCustoms = container.resolve(RegisterCustomsProvider);
  }

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
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const checkCategoryExists = await this.categoriesRepository.findByNameAndServerId(
      name,
      server.id,
    );

    if (checkCategoryExists) {
      throw new AppError({
        message: 'Category already registered.',
        statusCode: 409,
        message_ptbr:
          'Já existe uma outra categoria com esse nome, escolha um nome diferente.',
      });
    }

    const existsCommandWithSameName = await this.customCommandRepository.findByNameAndServerId(
      name,
      server.id,
    );

    if (existsCommandWithSameName) {
      throw new AppError({
        message: 'Exists a custom command with the same name.',
        statusCode: 409,
        message_ptbr:
          'Já existe um comando customizado com o mesmo nome, escolha um nome diferente.',
      });
    }

    const category = await this.categoriesRepository.create({
      server_id: server.id,
      name,
      description,
      enabled,
      show_in_menu,
      updated_by,
    });

    this.registerCustoms.execute();

    return category;
  }
}

export default CreateCategoryService;
