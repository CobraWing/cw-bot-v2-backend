import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

import authConfig from '@config/authConfig';

import AppError from '@shared/errors/AppError';

interface ITokenPayload {
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

    const { sub } = decoded as ITokenPayload;

    request.user = { discordId: sub };
    request.guild = { discordId: `${guildid}` };

    return next();
  } catch {
    throw new AppError('Invalid JWT token', 401);
  }
}
