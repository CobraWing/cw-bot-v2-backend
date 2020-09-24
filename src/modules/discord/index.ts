import { container } from 'tsyringe';
import RegisterDefaultsCommandsProvider from './providers/RegisterDefaultsCommandsProvider';
import RegisterCustomCommandsProvider from './providers/RegisterCustomCommandsProvider';
import ClientProvider from './providers/ClientProvider';

container.resolve(RegisterDefaultsCommandsProvider).execute();
container.resolve(RegisterCustomCommandsProvider).execute();
container.resolve(ClientProvider);
