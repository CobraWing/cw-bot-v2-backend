import { Exclude } from 'class-transformer';

interface IGuild {
  id: string;
  name: string;
  icon: string;
}

interface IUser {
  id: string;
  name: string;
  avatar: string;
}

class Authentication {
  token: string;

  user: IUser;

  guilds: IGuild[];

  @Exclude()
  access_token: string;

  @Exclude()
  expires_in: number;

  @Exclude()
  refresh_token: string;

  @Exclude()
  scope: string;

  @Exclude()
  token_type: string;
}

export default Authentication;
