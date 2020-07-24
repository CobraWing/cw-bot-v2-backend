import { Router } from 'express';
import FakeAuthorizationController from '@modules/@dev-stuff/controllers/FakeAuthorizationController';
import AuthorizationsController from '../controllers/AuthorizationsController';

const authRouter = Router();
const authorizationsController = new AuthorizationsController();
const fakeAuthorizationController = new FakeAuthorizationController();

authRouter.get('/discord', authorizationsController.request);
authRouter.get('/discord/authorized', authorizationsController.create);

if (process.env.NODE_ENV !== 'production') {
  authRouter.post('/dev', fakeAuthorizationController.create);
}

export default authRouter;
