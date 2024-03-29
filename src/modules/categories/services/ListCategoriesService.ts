/* eslint-disable no-restricted-syntax */
import { injectable, inject, delay } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CommandCategory from '../entities/CommandCategory';
import CategoriesRepository from '../repositories/typeorm/CategoriesRepository';
import CustomCommandRepository from '@modules/commands/repositories/typeorm/CustomCommandRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

interface IRequest {
  discord_id: string;
  countCommands?: boolean;
}

@injectable()
class ListCategoriesService {
  constructor(
    @inject(delay(() => CategoriesRepository))
    private categoriesRepository: ICategoriesRepository,
    @inject(delay(() => CustomCommandRepository))
    private customCommandRepository: ICustomCommandRepository,
    @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ discord_id, countCommands }: IRequest): Promise<CommandCategory[] | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(discord_id);

    if (!serverExists) {
      log.error(`[ListCategoriesService] server does not exists with id: ${discord_id}`);
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const categories = await this.categoriesRepository.listByServerId(serverExists.id);

    if (categories) {
      categories.sort((a, b) => (a.name > b.name ? 1 : -1));
    }

    if (categories && countCommands) {
      for await (const category of categories) {
        const [, counter] = await this.customCommandRepository.countByCategoryId(category.id);
        category.commands_count = counter;
      }
    }

    return categories;
  }
}

export default ListCategoriesService;
