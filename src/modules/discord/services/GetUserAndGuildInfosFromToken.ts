import { injectable } from 'tsyringe';
import axios from 'axios';

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
      ]).then(([user, guilds]) => {
        resolve({
          user: {
            ...user.data,
            avatar: this.formatAvatarUrl(user.data),
          },
          guilds: guilds.data,
        });
      });
    });
  }

  private formatAvatarUrl(userData: IUser): string {
    const { baseCDNUrl } = discordConfig.api;
    if (userData.avatar) {
      const suffix = userData.avatar.startsWith('a_') ? 'gif' : 'png';
      return `${baseCDNUrl}/avatars/${userData.id}/${userData.avatar}.${suffix}`;
    }
    return `${baseCDNUrl}/embed/avatars/0.png`;
  }
}

export default GetUserAndGuildInfosFromToken;
