import { container } from 'tsyringe';

import RegisterDefaultsCommandsProvider from './providers/RegisterDefaultsCommandsProvider';
import RegisterCustomsProvider from './providers/RegisterCustomsProvider';
import ClientProvider from './providers/ClientProvider';
import RegisterEventsProvider from './providers/RegisterEventsProvider';
import RegisterWingCommandsProvider from './providers/RegisterWingCommandsProvider';

container.resolve(RegisterDefaultsCommandsProvider).execute();
container.resolve(RegisterCustomsProvider).execute();
container.resolve(RegisterEventsProvider).execute();
container.resolve(RegisterWingCommandsProvider).execute();
container.resolve(ClientProvider);
