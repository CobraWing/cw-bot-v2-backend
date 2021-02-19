import { Request, Response } from 'express';
import { container } from 'tsyringe';

import FindAllTextChanneInServerService from '@modules/servers/services/FindAllTextChanneInServerService';

class ChannelsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { discordId } = request.guild;

    const findAllTextChanneInServerService = container.resolve(FindAllTextChanneInServerService);

    const channels = await findAllTextChanneInServerService.execute({ discordId });

    if (channels) {
      return response.json(channels);
    }
    return response.status(204).json([]);
  }
}

export default ChannelsController;
