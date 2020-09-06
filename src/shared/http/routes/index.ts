import { Router, Request, Response } from 'express';

import categoriesRouter from '@modules/categories/routes/categories.routes';
import customCommandRouter from '@modules/commands/routes/customCommand.routes';
import serversRouter from '@modules/servers/routes/servers.routes';
import authorizationRouter from '@modules/authorizations/routes/authorization.routes';

const routes = Router();

routes.use('/servers', serversRouter);
routes.use('/categories', categoriesRouter);
routes.use('/customCommands', customCommandRouter);
routes.use('/authorizations', authorizationRouter);

routes.use('/alive', (request: Request, response: Response) => {
  response.send('Hello!');
});

export default routes;
