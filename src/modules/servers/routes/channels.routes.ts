import { Router } from 'express';

import ensureAuthenticated from '@shared/http/middlewares/ensureAuthenticated';
import ChannelsController from '../controllers/ChannelsController';

const channelsRouter = Router();
const channelsController = new ChannelsController();

channelsRouter.use(ensureAuthenticated);

channelsRouter.get('/', channelsController.index);

export default channelsRouter;
