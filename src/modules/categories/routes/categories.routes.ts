import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import ensureAuthenticated from '@shared/http/middlewares/ensureAuthenticated';
import CategoriesController from '../controllers/CategoriesController';

const categoriesRouter = Router();
const categoriesController = new CategoriesController();

categoriesRouter.use(ensureAuthenticated);

categoriesRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      description: Joi.string().required(),
      enabled: Joi.boolean().required(),
      show_in_menu: Joi.boolean().required(),
    },
  }),
  categoriesController.create,
);

categoriesRouter.put(
  '/:category_id',
  celebrate({
    [Segments.PARAMS]: {
      category_id: Joi.string().uuid().required(),
    },
    [Segments.BODY]: {
      name: Joi.string().required(),
      description: Joi.string().required(),
      enabled: Joi.boolean().required(),
      show_in_menu: Joi.boolean().required(),
    },
  }),
  categoriesController.update,
);

categoriesRouter.get('/', categoriesController.index);

categoriesRouter.get(
  '/:category_id',
  celebrate({
    [Segments.PARAMS]: {
      category_id: Joi.string().uuid().required(),
    },
  }),
  categoriesController.show,
);

categoriesRouter.delete(
  '/:category_id',
  celebrate({
    [Segments.PARAMS]: {
      category_id: Joi.string().uuid().required(),
    },
  }),
  categoriesController.delete,
);

export default categoriesRouter;
