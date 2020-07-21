import { injectable, inject, container } from 'tsyringe';
import { sign } from 'jsonwebtoken';
import axios from 'axios';
import log from 'heroku-logger';

import AppError from '@shared/errors/AppError';
import IHashProvider from '@shared/providers/HashProvider/models/IHashProvider';
import authConfig from '@config/authConfig';
import GetUserAndGuildInfosFromToken from '@modules/discord/services/GetUserAndGuildInfosFromToken';
import FilterPermittedGuilds from '@modules/discord/services/FilterPermittedGuilds';
import Authentication from '../entities/Authentication';

interface IRequest {
  code: string;
}

@injectable()
class AuthenticateUserService {
  constructor(
    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({ code }: IRequest): Promise<Authentication> {
    const getUserAndGuildInfos = container.resolve(
      GetUserAndGuildInfosFromToken,
    );
    const filterPermittedGuilds = container.resolve(FilterPermittedGuilds);
    const { tokenUrl, tokenParams } = authConfig.discord;
    const { secret, expiresIn } = authConfig.jwt;

    const requestData = `${tokenParams}&code=${code}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await axios
        .post(tokenUrl, requestData, {
          headers,
        })
        .catch(err => {
          log.error('Error while get token', err);
          throw new Error();
        });

      const { user, guilds } = await getUserAndGuildInfos
        .execute({
          token: response.data.access_token,
        })
        .catch(err => {
          log.error('Error while get user and guild infos', err);
          throw new Error();
        });

      const { id, username: name, avatar } = user;

      const permittedGuilds = await filterPermittedGuilds
        .execute({
          user_id: user.id,
          guilds,
        })
        .catch(err => {
          log.error('Error while filter permitted guilds', err);
          throw new Error();
        });

      const authorization = new Authentication();
      Object.assign(authorization, {
        token: sign({ id }, secret, {
          subject: id,
          expiresIn,
        }),
        user: { id, name, avatar },
        guilds: permittedGuilds,
      });
      return authorization;
    } catch (err) {
      log.error('Error while authenticate', err);
      throw new AppError('Error while authenticate');
    }
  }
}

export default AuthenticateUserService;
