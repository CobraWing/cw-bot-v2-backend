import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import log from 'heroku-logger';

import authConfig from '@config/authConfig';

import AppError from '@shared/errors/AppError';

interface ITokenPayload {
  uId: string;
  uName: string;
  gIds: string[];
  iat: number;
  exp: number;
  sub: string;
}

export default function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  const { authorization, guildid } = request.headers;

  if (!authorization) {
    throw new AppError('JWT token is missing', 401);
  }
  if (!guildid) {
    throw new AppError('Guild information is missing', 400);
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = verify(token, authConfig.jwt.secret);

    const { uId, uName, gIds } = decoded as ITokenPayload;

    if (!gIds.includes(`${guildid}`)) {
      log.error(
        `User name=[${uName}] and id=[${uId}] has no permission to guild id=[${guildid}], his guilds ids=[${gIds}]`,
      );
      throw new Error();
    }

    request.user = { discordId: uId, name: uName };
    request.guild = { discordId: `${guildid}` };

    return next();
  } catch {
    throw new AppError('Invalid credentials', 401);
  }
}
