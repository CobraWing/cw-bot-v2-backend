import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateServerService from '@modules/servers/services/CreateServerService';
import FindAllEnabledServersService from '@modules/servers/services/FindAllEnabledServersService';

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

  public async index(request: Request, response: Response): Promise<Response> {
    const findAllEnabledServers = container.resolve(
      FindAllEnabledServersService,
    );

    const servers = await findAllEnabledServers.execute();

    if (servers) {
      return response.json(classToClass(servers));
    }
    return response.status(204).json([]);
  }
}

export default ServersController;
