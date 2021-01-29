import { container } from 'tsyringe';

import TickNotificationRunner from './runners/TickNotificationRunner';
import GalnetNotificationRunner from './runners/GalnetNotificationRunner';

container.resolve(TickNotificationRunner).execute();
container.resolve(GalnetNotificationRunner).execute();
