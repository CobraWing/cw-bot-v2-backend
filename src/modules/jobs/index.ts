import { container } from 'tsyringe';

import TickNotificationRunner from './runners/TickNotificationRunner';

container.resolve(TickNotificationRunner).execute();
