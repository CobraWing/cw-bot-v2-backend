import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { classToClass } from 'class-transformer';
import log from 'heroku-logger';

import authConfig from '@config/authConfig';
import Authentication from '@modules/authorizations/entities/Authentication';

class FakeAuthorizationController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { discordUserId: id } = request.body;

    if (!id) {
      return response.status(400).json({ error: 'Bad request' });
    }

    try {
      const { secret, expiresIn } = authConfig.jwt;
      const authorization = new Authentication();
      Object.assign(authorization, {
        token: sign({ id }, secret, {
          subject: id,
          expiresIn,
        }),
        user: { id, name: 'fake', avatar: '' },
        guilds: [],
      });
      return response.status(201).json(classToClass(authorization));
    } catch (err) {
      log.error('Error while authenticate', [err.message, err.stack]);
      return response.status(401).json({ error: 'Not authorized' });
    }
  }
}

export default FakeAuthorizationController;
