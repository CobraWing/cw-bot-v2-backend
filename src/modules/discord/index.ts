import { container } from 'tsyringe';

import RegisterDefaultsCommandsProvider from './providers/RegisterDefaultsCommandsProvider';
import RegisterCustomsProvider from './providers/RegisterCustomsProvider';
import ClientProvider from './providers/ClientProvider';
import RegisterEventsProvider from './providers/RegisterEventsProvider';

container.resolve(RegisterDefaultsCommandsProvider).execute();
container.resolve(RegisterCustomsProvider).execute();
container.resolve(RegisterEventsProvider).execute();
container.resolve(ClientProvider);
