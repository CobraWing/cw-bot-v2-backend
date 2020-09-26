import { container } from 'tsyringe';
import RegisterDefaultsCommandsProvider from './providers/RegisterDefaultsCommandsProvider';
import RegisterCategoriesCommandsProvider from './providers/RegisterCategoriesCommandsProvider';
import RegisterCustomCommandsProvider from './providers/RegisterCustomCommandsProvider';
import ClientProvider from './providers/ClientProvider';

container.resolve(RegisterDefaultsCommandsProvider).execute();
container.resolve(RegisterCategoriesCommandsProvider).execute();
container.resolve(RegisterCustomCommandsProvider).execute();
container.resolve(ClientProvider);
