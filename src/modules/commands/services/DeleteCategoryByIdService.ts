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
class DeleteCategoryByIdService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {}

  public async execute({ discord_id, category_id }: IRequest): Promise<void> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[DeleteCategoryByIdService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError('Server does not exists');
    }

    await this.categoriesRepository.deleteByIdAndServerId(
      category_id,
      serverExists.id,
    );
  }
}

export default DeleteCategoryByIdService;
