import { injectable, inject, container } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICategoriesRepository from '@modules/categories/repositories/ICategoriesRepository';
import RegisterCustomsProvider from '@modules/discord/providers/RegisterCustomsProvider';
import CustomCommand from '@modules/commands/entities/CustomCommand';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';

interface IRequest {
  discordId: string;
  category_id: string;
  enabled: boolean;
  show_in_menu: boolean;
  name: string;
  description: string;
  title: string;
  content: string;
  image_content: string;
  image_thumbnail: string;
  embedded?: boolean;
  color?: string;
  footer_text?: string;
  role_limited?: boolean;
  role_blacklist?: string;
  role_whitelist?: string;
  channel_limited?: boolean;
  channel_blacklist?: string;
  channel_whitelist?: string;
  updated_by: string;
}

@injectable()
class CreateCustomCommandService {
  private registerCustoms: RegisterCustomsProvider;

  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {
    this.registerCustoms = container.resolve(RegisterCustomsProvider);
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

    const checkCustomCommandAlreadyExists = await this.customCommandRepository.findByNameAndServerId(
      data.name,
      server.id,
    );

    if (checkCustomCommandAlreadyExists) {
      throw new AppError({
        message: 'Custom command name already registered.',
        statusCode: 409,
        message_ptbr: 'Já existe um comando customizado com o mesmo nome, escolha um nome diferente.',
      });
    }

    const checkNameAlreadyExists = await this.categoriesRepository.findByNameAndServerId(data.name, server.id);

    if (checkNameAlreadyExists) {
      throw new AppError({
        message: 'Category already registered.',
        statusCode: 409,
        message_ptbr: 'Já existe uma categoria com o mesmo nome, escolha um nome diferente.',
      });
    }

    const customCommand = await this.customCommandRepository.create({
      server_id: server.id,
      ...data,
      embedded: true,
      color: '#EE0000',
      content: !data.content ? '<p></p>' : data.content,
    });

    this.registerCustoms.execute();

    return customCommand;
  }
}

export default CreateCustomCommandService;
