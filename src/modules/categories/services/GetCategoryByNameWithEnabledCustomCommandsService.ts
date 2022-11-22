/* eslint-disable no-restricted-syntax */
import { injectable, inject, delay } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CommandCategory from '../entities/CommandCategory';
import CategoriesRepository from '../repositories/typeorm/CategoriesRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

interface IRequest {
  discord_id: string;
  name: string;
}

@injectable()
class GetCategoryByNameWithEnabledCustomCommandsService {
  constructor(
   @inject(delay(() => CategoriesRepository))
    private categoriesRepository: ICategoriesRepository,
   @inject(delay(() => ServersRepository))
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ discord_id, name }: IRequest): Promise<CommandCategory | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(discord_id);

    if (!serverExists) {
      log.error(`[GetCategoryByNameWithEnabledCustomCommandsService] server does not exists with id: ${discord_id}`);
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const category = await this.categoriesRepository.getCategoryByNameAndServerIdAndListCommandsEnabled(
      name,
      serverExists.id,
    );

    return category;
  }
}

export default GetCategoryByNameWithEnabledCustomCommandsService;
