/* eslint-disable no-restricted-syntax */
import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  discord_id: string;
  show_in_menu: boolean;
}

@injectable()
class ListEnabledCategoriesWithEnabledCustomCommandsService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    discord_id,
    show_in_menu,
  }: IRequest): Promise<CommandCategory[] | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[ListEnabledCategoriesWithEnabledCustomCommandsService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    const categories = await this.categoriesRepository.listEnabledByServerIdAndEnableCustomCommand(
      serverExists.id,
      show_in_menu,
    );

    return categories;
  }
}

export default ListEnabledCategoriesWithEnabledCustomCommandsService;
