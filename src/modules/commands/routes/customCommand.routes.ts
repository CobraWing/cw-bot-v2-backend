import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@shared/http/middlewares/ensureAuthenticated';
import CategoriesController from '../controllers/CustomCommandController';

const customCommandRouter = Router();
const customCommandController = new CategoriesController();

customCommandRouter.use(ensureAuthenticated);

customCommandRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      category_id: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().required(),
      title: Joi.string().optional().allow('').allow(null),
      content: Joi.string().optional().allow('').allow(null),
      image_content: Joi.string().optional().allow('').allow(null),
      image_thumbnail: Joi.string().optional().allow('').allow(null),
      enabled: Joi.boolean().required(),
      show_in_menu: Joi.boolean().required(),
    },
  }),
  customCommandController.create,
);

customCommandRouter.put(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      category_id: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().required(),
      title: Joi.string().optional().allow('').allow(null),
      content: Joi.string().optional().allow('').allow(null),
      image_content: Joi.string().optional().allow('').allow(null),
      image_thumbnail: Joi.string().optional().allow('').allow(null),
      enabled: Joi.boolean().required(),
      show_in_menu: Joi.boolean().required(),
      embedded: Joi.boolean().optional(),
      color: Joi.string().optional().allow('').allow(null),
      footer_text: Joi.string().optional().allow('').allow(null),
      role_limited: Joi.boolean().optional().allow(null),
      role_blacklist: Joi.string().optional().allow('').allow(null),
      role_whitelist: Joi.string().optional().allow('').allow(null),
      channel_limited: Joi.boolean().optional().allow(null),
      channel_blacklist: Joi.string().optional().allow('').allow(null),
      channel_whitelist: Joi.string().optional().allow('').allow(null),
    },
  }),
  customCommandController.update,
);

customCommandRouter.get(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  customCommandController.show,
);

customCommandRouter.get('/', customCommandController.index);

customCommandRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  customCommandController.delete,
);

export default customCommandRouter;
