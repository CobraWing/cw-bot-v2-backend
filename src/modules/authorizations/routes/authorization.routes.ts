import { Router } from 'express';
import AuthorizationsController from '../controllers/AuthorizationsController';

const authRouter = Router();
const authorizationsController = new AuthorizationsController();

authRouter.get('/discord', authorizationsController.create);
authRouter.get('/discord/authorized', authorizationsController.callback);

export default authRouter;
