import { Router } from 'express';
import AuthorizationsController from '../controllers/AuthorizationsController';

const authRouter = Router();
const authorizationsController = new AuthorizationsController();

authRouter.get('/discord', authorizationsController.request);
authRouter.get('/discord/authorized', authorizationsController.create);

export default authRouter;
