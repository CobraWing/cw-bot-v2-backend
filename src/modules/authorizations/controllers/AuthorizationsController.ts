import { Request, Response } from 'express';
import axios from 'axios';

import authConfig from '@config/authConfig';

const { authorizeUrl, tokenUrl, oauth } = authConfig.discord;
const params =
  `client_id=${oauth.clientId}&redirect_uri=${oauth.clientRedirect}` +
  `&scope=${oauth.clientScopes}&response_type=code`;

class AuthorizationsController {
  public async create(request: Request, response: Response): Promise<void> {
    return response.redirect(`${authorizeUrl}?${params}`);
  }

  public async callback(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { code } = request.query;
    const data = `${params}&code=${code}&client_secret=${oauth.clientSecret}&grant_type=authorization_code`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const callbackResponse = await axios.post(tokenUrl, data, {
        headers,
      });

      return response.status(201).json(callbackResponse.data);
    } catch {
      return response.status(401).json({ error: 'Not authorized' });
    }
  }
}

export default AuthorizationsController;
