import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';

import ServersController from '../controllers/ServersController';

const serversRouter = Router();
const serversController = new ServersController();

serversRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      id_discord: Joi.string().required(),
    },
  }),
  serversController.create,
);

export default serversRouter;
