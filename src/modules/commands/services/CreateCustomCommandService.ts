import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ICustomCommandRepository from '../repositories/ICustomCommandRepository';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  discordId: string;
  category_id: string;
  enabled: boolean;
  show_in_menu: boolean;
  name: string;
  description: string;
  content?: string;
  image_content?: string;
  image_thumbnail?: string;
  updated_by?: string;
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

  public async execute({
    discordId,
    category_id,
    enabled,
    show_in_menu,
    name,
    description,
    content,
    image_content,
    image_thumbnail,
    updated_by,
  }: IRequest): Promise<CommandCategory> {
    const server = await this.serversRepository.findByIdDiscord(discordId);

    if (!server) {
      throw new AppError('Server not found');
    }

    const categoryExists = await this.categoriesRepository.findByIdAndServerId(
      category_id,
      server.id,
    );

    if (!categoryExists) {
      throw new AppError('Category not found');
    }

    const customCommand = await this.customCommandRepository.create({
      server_id: server.id,
      category_id,
      enabled,
      show_in_menu,
      name,
      description,
      content,
      image_content,
      image_thumbnail,
      updated_by,
    });

    return customCommand;
  }
}

export default CreateCustomCommandService;
