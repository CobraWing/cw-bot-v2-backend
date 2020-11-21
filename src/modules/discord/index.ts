import { container } from 'tsyringe';

import RegisterDefaultsCommandsProvider from './providers/RegisterDefaultsCommandsProvider';
import RegisterCustomsProvider from './providers/RegisterCustomsProvider';
import ClientProvider from './providers/ClientProvider';
import RegisterWelcomeMessageProvider from './providers/RegisterWelcomeMessageProvider';

container.resolve(RegisterDefaultsCommandsProvider).execute();
container.resolve(RegisterCustomsProvider).execute();
container.resolve(RegisterWelcomeMessageProvider).execute();
container.resolve(ClientProvider);
