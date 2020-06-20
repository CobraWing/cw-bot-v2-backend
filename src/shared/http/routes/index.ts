import { Router, Request, Response } from 'express';

import categoriesRouter from '@modules/commands/routes/categories.routes';

const routes = Router();

routes.use('/categories', categoriesRouter);

routes.use('/', (request: Request, response: Response) => {
  response.send('Hello!');
});

export default routes;
