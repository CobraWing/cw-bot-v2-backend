import { container } from 'tsyringe';
import RegisterCustomCommandsProvider from './providers/RegisterCustomCommandsProvider';
import ClientProvider from './providers/ClientProvider';

container.resolve(RegisterCustomCommandsProvider).execute();
container.resolve(ClientProvider);
