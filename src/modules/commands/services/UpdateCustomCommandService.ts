import { injectable, inject, container, delay } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICategoriesRepository from '@modules/categories/repositories/ICategoriesRepository';
import RegisterCustomsProvider from '@modules/discord/providers/RegisterCustomsProvider';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import CustomCommand from '../entities/CustomCommand';
import CustomCommandRepository from '../repositories/typeorm/CustomCommandRepository';
import CategoriesRepository from '@modules/categories/repositories/typeorm/CategoriesRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

interface IRequest {
  discordId: string;
  id: string;
  category_id: string;
  enabled: boolean;
  show_in_menu: boolean;
  name: string;
  description: string;
  title: string;
  content: string;
  image_content: string;
  image_thumbnail: string;
  embedded: boolean;
  color: string;
  footer_text: string;
  role_limited: boolean;
  role_blacklist: string;
  role_whitelist: string;
  channel_limited: boolean;
  channel_blacklist: string;
  channel_whitelist: string;
  updated_by: string;
}

@injectable()
class UpdateCustomCommandService {
  private registerCustomsProvider: RegisterCustomsProvider;

  constructor(
    @inject(delay(() => CustomCommandRepository))
    private customCommandRepository: ICustomCommandRepository,
    @inject(delay(() => CategoriesRepository))
    private categoriesRepository: ICategoriesRepository,
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {
    this.registerCustomsProvider = container.resolve(RegisterCustomsProvider);
  }

  public async execute(data: IRequest): Promise<CustomCommand> {
    const server = await this.serversRepository.findByIdDiscord(data.discordId);

    if (!server) {
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const categoryExists = await this.categoriesRepository.findByIdAndServerId(data.category_id, server.id);

    if (!categoryExists) {
      throw new AppError({
        message: 'Category not found',
        statusCode: 409,
        message_ptbr: 'Categoria não encontrada.',
      });
    }

    const checkCategoryNameAlreadyExists = await this.categoriesRepository.findByNameAndServerId(data.name, server.id);

    if (checkCategoryNameAlreadyExists) {
      throw new AppError({
        message: 'Category already registered.',
        statusCode: 409,
        message_ptbr: 'Já existe uma categoria com o mesmo nome, escolha um nome diferente.',
      });
    }

    const commandNameAlreadyExists = await this.customCommandRepository.findByNotInIdAndNameAndServerId(
      data.id,
      data.name,
      server.id,
    );

    if (commandNameAlreadyExists) {
      throw new AppError({
        message: 'Custom command name already exists.',
        statusCode: 409,
        message_ptbr: 'Já existe um outro comando customizado com o mesmo nome, escolha um nome diferente.',
      });
    }

    const customCommandExists = await this.customCommandRepository.findByIdAndServerId(data.id, server.id);

    if (!customCommandExists) {
      throw new AppError({
        message: 'Custom command not found to edit',
        statusCode: 409,
        message_ptbr: 'Comando não encontrado para edição.',
      });
    }

    Object.assign(customCommandExists, {
      ...data,
    });

    const customCommandUpdated = await this.customCommandRepository.update(customCommandExists);

    this.registerCustomsProvider.execute();

    return customCommandUpdated;
  }
}

export default UpdateCustomCommandService;
