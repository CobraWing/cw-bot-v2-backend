import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  discord_id: string;
}

@injectable()
class ListCategoriesService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    discord_id,
  }: IRequest): Promise<CommandCategory[] | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[ListCategoriesService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError('Server does not exists');
    }

    const categories = await this.categoriesRepository.listByServerId(
      serverExists.id,
    );

    if (categories) {
      categories.sort((a, b) => (a.name > b.name ? 1 : -1));
    }

    return categories;
  }
}

export default ListCategoriesService;
