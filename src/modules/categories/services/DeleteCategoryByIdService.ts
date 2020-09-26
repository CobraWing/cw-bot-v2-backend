import { injectable, inject, container } from 'tsyringe';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import RegisterCustomsProvider from '@modules/discord/providers/RegisterCustomsProvider';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';

interface IRequest {
  discord_id: string;
  category_id: string;
}

@injectable()
class DeleteCategoryByIdService {
  private registerCustomsProvider: RegisterCustomsProvider;

  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
    @inject('ServersRepository')
    private serversRepository: IServersRepository,
  ) {
    this.registerCustomsProvider = container.resolve(RegisterCustomsProvider);
  }

  public async execute({ discord_id, category_id }: IRequest): Promise<void> {
    const serverExists = await this.serversRepository.findByIdDiscord(
      discord_id,
    );

    if (!serverExists) {
      log.error(
        `[DeleteCategoryByIdService] server does not exists with id: ${discord_id}`,
      );
      throw new AppError({
        message: 'Server not found.',
        message_ptbr: 'Servidor não encontrado.',
      });
    }

    await this.categoriesRepository.deleteByIdAndServerId(
      category_id,
      serverExists.id,
    );

    this.registerCustomsProvider.execute();
  }
}

export default DeleteCategoryByIdService;
