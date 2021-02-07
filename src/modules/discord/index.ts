import { container } from 'tsyringe';

import RegisterDefaultsCommandsProvider from '@modules/discord/providers/RegisterDefaultsCommandsProvider';
import RegisterCustomsProvider from '@modules/discord/providers/RegisterCustomsProvider';
import ClientProvider from '@modules/discord/providers/ClientProvider';
import RegisterEventsProvider from '@modules/discord/providers/RegisterEventsProvider';
import RegisterWingCommandsProvider from '@modules/discord/providers/RegisterWingCommandsProvider';

container.resolve(RegisterDefaultsCommandsProvider).execute();
container.resolve(RegisterCustomsProvider).execute();
container.resolve(RegisterEventsProvider).execute();
container.resolve(RegisterWingCommandsProvider).execute();
container.resolve(ClientProvider);
