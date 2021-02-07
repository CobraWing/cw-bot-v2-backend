import { injectable } from 'tsyringe';
import axios from 'axios';
import log from 'heroku-logger';

import discordConfig from '@config/discordConfig';

interface IGuildResponse {
  id: string;
  name: string;
  owner: boolean;
  icon: string;
}

interface IUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
}

interface IResponse {
  user: IUser;
  guilds: IGuildResponse[];
}

interface IRequest {
  token: string;
}

@injectable()
class GetUserAndGuildInfosFromToken {
  public async execute({ token }: IRequest): Promise<IResponse> {
    const { baseApiUrl } = discordConfig.api;
    const data = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    return new Promise(resolve => {
      Promise.all([
        axios.get<IUser>(`${baseApiUrl}/users/@me`, data),
        axios.get(`${baseApiUrl}/users/@me/guilds`, data),
      ])
        .then(([user, guilds]) => {
          resolve({
            user: {
              ...user.data,
              avatar: this.formatAvatarUrl(user.data),
            },
            guilds: guilds.data,
          });
        })
        .catch(err => {
          log.error('Error while get user and guild infos using token', [err.message, err.stack]);
          throw new Error('Error while get user and guild infos using token');
        });
    });
  }

  private formatAvatarUrl(userData: IUser): string {
    const { baseCDNUrl } = discordConfig.api;
    if (userData.avatar) {
      const suffix = userData.avatar.startsWith('a_') ? 'gif' : 'png';
      return `${baseCDNUrl}/avatars/${userData.id}/${userData.avatar}.${suffix}`;
    }
    const discriminator = Number(userData.discriminator.replace('#', ''));
    const defaultAvatarId = discriminator % 5;
    return `${baseCDNUrl}/embed/avatars/${defaultAvatarId}.png`;
  }
}

export default GetUserAndGuildInfosFromToken;
