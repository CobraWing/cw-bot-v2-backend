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
          log.error('Error while get token', [err.message, err.stack]);
          throw new Error('Error while get token');
        });

      log.info('[AuthenticateUserService] getting user and guild infos');

      const { user, guilds } = await getUserAndGuildInfos
        .execute({
          token: response.data.access_token,
        })
        .catch(err => {
          log.error('Error while get user and guild infos', [
            err.message,
            err.stack,
          ]);
          throw new Error('Error while get user and guild infos');
        });

      log.info(
        `[AuthenticateUserService] found user: ${user} and guilds: ${guilds} from user`,
      );

      const { id: uId, username: name, avatar } = user;

      log.info('[AuthenticateUserService] filter permitted guilds...');

      const permittedGuilds = await filterPermittedGuilds
        .execute({
          user_id: user.id,
          guilds,
        })
        .catch(err => {
          log.error('Error while filter permitted guilds', [
            err.message,
            err.stack,
          ]);
          throw new Error('Error while filter permitted guilds');
        });

      log.info(
        `[AuthenticateUserService] guilds permitted: ${permittedGuilds}`,
      );

      const authorization = new Authentication();
      const gIds = permittedGuilds.map(guild => guild.id);
      Object.assign(authorization, {
        token: sign({ uId, uName: name, gIds }, secret, {
          subject: uId,
          expiresIn,
        }),
        user: { uId, name, avatar },
        guilds: permittedGuilds,
      });
      log.info(
        `[AuthenticateUserService] return authorization: ${authorization}`,
      );
      return authorization;
    } catch (err) {
      log.error('Error while authenticate', [err.message, err.stack]);
      throw new AppError('Error while authenticate');
    }
  }
}

export default AuthenticateUserService;
