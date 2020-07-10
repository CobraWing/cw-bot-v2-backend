import { injectable, inject } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import ICategoriesRepository from '../repositories/ICategoriesRepository';
import CommandCategory from '../entities/CommandCategory';

interface IRequest {
  server_id: string;
  name: string;
  description: string;
  show_in_menu: boolean;
}

@injectable()
class CreateCategoryService {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository,
  ) {}

  public async execute({
    server_id,
    name,
    description,
    show_in_menu,
  }: IRequest): Promise<CommandCategory> {
    const checkCategoryExists = await this.categoriesRepository.findByNameAndServerId(
      name,
      server_id,
    );

    if (checkCategoryExists) {
      throw new AppError('Category already registered');
    }

    const category = await this.categoriesRepository.create({
      server_id,
      name,
      description,
      show_in_menu,
    });

    return category;
  }
}

export default CreateCategoryService;
