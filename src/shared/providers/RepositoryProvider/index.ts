import { container } from 'tsyringe';

import ICategoriesRepository from '@modules/commands/repositories/ICategoriesRepository';
import CategoriesRepository from '@modules/commands/repositories/typeorm/CategoriesRepository';

container.registerSingleton<ICategoriesRepository>(
  'CategoriesRepository',
  CategoriesRepository,
);
