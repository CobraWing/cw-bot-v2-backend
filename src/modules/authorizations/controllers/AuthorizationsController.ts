import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import AuthenticateUserService from '@modules/authorizations/services/AuthenticateUserService';

import authConfig from '@config/authConfig';

const { authorizeUrl, authorizeParams } = authConfig.discord;

class AuthorizationsController {
  public async request(
    request: Request,
    response: Response,
  ): Promise<Response> {
    return response.json({ url: `${authorizeUrl}?${authorizeParams}` });
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const authenticateUserService = container.resolve(AuthenticateUserService);

    const { code } = request.body;

    if (!code) {
      return response.status(400).json({ error: 'Bad request' });
    }

    try {
      const authorization = await authenticateUserService.execute({
        code: `${code}`,
      });

      return response.status(201).json(classToClass(authorization));
    } catch {
      return response.status(401).json({ error: 'Not authorized' });
    }
  }
}

export default AuthorizationsController;
