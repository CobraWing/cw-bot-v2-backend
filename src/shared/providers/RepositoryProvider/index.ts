import { container } from 'tsyringe';

import IServersRepository from '@modules/servers/repositories/IServersRepository';
import ServersRepository from '@modules/servers/repositories/typeorm/ServersRepository';

import IConfigurationsRepository from '@modules/configurations/repositories/IConfigurationsRepository';
import ConfigurationsRepository from '@modules/configurations/repositories/typeorm/ConfigurationsRepository';

import ICategoriesRepository from '@modules/commands/repositories/ICategoriesRepository';
import CategoriesRepository from '@modules/commands/repositories/typeorm/CategoriesRepository';

import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import CustomCommandRepository from '@modules/commands/repositories/typeorm/CustomCommandRepository';

container.registerSingleton<IServersRepository>(
  'ServersRepository',
  ServersRepository,
);

container.registerSingleton<IConfigurationsRepository>(
  'ConfigurationsRepository',
  ConfigurationsRepository,
);

container.registerSingleton<ICategoriesRepository>(
  'CategoriesRepository',
  CategoriesRepository,
);

container.registerSingleton<ICustomCommandRepository>(
  'CustomCommandRepository',
  CustomCommandRepository,
);
