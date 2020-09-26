import { container } from 'tsyringe';

import RegisterDefaultsCommandsProvider from './providers/RegisterDefaultsCommandsProvider';
import RegisterCustomsProvider from './providers/RegisterCustomsProvider';
import ClientProvider from './providers/ClientProvider';

container.resolve(RegisterDefaultsCommandsProvider).execute();
container.resolve(RegisterCustomsProvider).execute();
container.resolve(ClientProvider);
