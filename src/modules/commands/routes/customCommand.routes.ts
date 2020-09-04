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
      enabled: Joi.boolean().required(),
      show_in_menu: Joi.boolean().required(),
      content: Joi.string(),
      image_content: Joi.string(),
      image_thumbnail: Joi.string(),
    },
  }),
  customCommandController.create,
);

export default customCommandRouter;
