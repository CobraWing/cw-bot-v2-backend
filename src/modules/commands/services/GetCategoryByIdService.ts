import { injectable, inject } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  discord_id: string;
  category_id: string;
}

@injectable()
class GetCategoryByIdService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({
    discord_id,
    category_id,
  }: IRequest): Promise<CommandCategory | undefined> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[GetCategoryByIdService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError('Server does not exists');
    }

    const category = await this.categoriesRepository.getByIdAndServerId(
      category_id,
      serverExists.id,
    );

    return category;
  }
}

export default GetCategoryByIdService;
