import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import IServersRepository from '../../servers/repositories/IServersRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  server_id: string;
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
    server_id,
  }: IRequest): Promise<CommandCategory[] | undefined> {
    const serverExists = await this.serversRepository.findByServerId(server_id);

    if (!serverExists) {
      throw new AppError('Server does not exists');
    }

    const categories = await this.categoriesRepository.listByServerId(
      server_id,
    );

    return categories;
  }
}

export default ListCategoriesService;
