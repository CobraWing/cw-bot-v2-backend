import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICategoriesRepository from '@modules/categories/repositories/ICategoriesRepository';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import CustomCommand from '../entities/CustomCommand';

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
  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute(data: IRequest): Promise<CustomCommand> {
    const server = await this.serversRepository.findByIdDiscord(data.discordId);

    if (!server) {
      throw new AppError('Server not found');
    }

    const categoryExists = await this.categoriesRepository.findByIdAndServerId(
      data.category_id,
      server.id,
    );

    if (!categoryExists) {
      throw new AppError('Category not found');
    }

    const customCommandExists = await this.customCommandRepository.findByIdAndServerId(
      data.id,
      server.id,
    );

    if (!customCommandExists) {
      throw new AppError('Custom command not found to edit');
    }

    Object.assign(customCommandExists, {
      ...data,
    });

    const customCommandUpdated = await this.customCommandRepository.update(
      customCommandExists,
    );

    return customCommandUpdated;
  }
}

export default UpdateCustomCommandService;
