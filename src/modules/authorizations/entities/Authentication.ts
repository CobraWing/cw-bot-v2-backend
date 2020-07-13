import { Exclude } from 'class-transformer';

interface IUser {
  id: string;
  name: string;
  avatar: string;
}

class Authentication {
  token: string;

  user: IUser;

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
