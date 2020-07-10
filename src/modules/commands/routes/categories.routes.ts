import { Router } from 'express';
import { celebrate, Segments, Joi } from 'celebrate';
import CategoriesController from '../controllers/CategoriesController';

const categoriesRouter = Router();
const categoriesController = new CategoriesController();

categoriesRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      server_id: Joi.string().required().uuid(),
      name: Joi.string().required(),
      description: Joi.string().required(),
      show_in_menu: Joi.boolean().required(),
    },
  }),
  categoriesController.create,
);

export default categoriesRouter;
