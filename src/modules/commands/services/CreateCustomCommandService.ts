import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICategoriesRepository from '@modules/categories/repositories/ICategoriesRepository';
import CommandCategory from '@modules/categories/entities/CommandCategory';
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
  constructor(
    @inject('CustomCommandRepository')
    private customCommandRepository: ICustomCommandRepository,
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

    const categoryExists = await this.categoriesRepository.findByIdAndServerId(
      data.category_id,
      server.id,
    );

    if (!categoryExists) {
      throw new AppError('Category not found');
    }

    const customCommand = await this.customCommandRepository.create({
      server_id: server.id,
      ...data,
      embedded: true,
      color: '#EE0000',
    });

    return customCommand;
  }
}

export default CreateCustomCommandService;
