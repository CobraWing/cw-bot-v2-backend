import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateServerService from '@modules/servers/services/CreateServerService';

class ServersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, id_discord } = request.body;

    const createServer = container.resolve(CreateServerService);

    const user = await createServer.execute({
      name,
      id_discord,
    });

    return response.json(classToClass(user));
  }
}

export default ServersController;
