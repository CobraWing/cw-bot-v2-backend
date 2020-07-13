import { injectable, inject } from 'tsyringe';
import { sign } from 'jsonwebtoken';
import axios from 'axios';

import AppError from '@shared/errors/AppError';
import IHashProvider from '@shared/providers/HashProvider/models/IHashProvider';
import authConfig from '@config/authConfig';
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
    const { tokenUrl, tokenParams } = authConfig.discord;

    const requestData = `${tokenParams}&code=${code}`;
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await axios.post(tokenUrl, requestData, {
        headers,
      });

      const { data: authData } = response;

      // TODO: Get user infos

      // TODO: Save user session

      const { secret, expiresIn } = authConfig.jwt;
      const token = sign({}, secret, {
        subject: 'user.id',
        expiresIn,
      });

      const authorization = new Authentication();
      Object.assign(authorization, {
        ...authData,
        token,
        user: {
          id: '123456',
          name: 'Pivatto',
          avatar: 'abc123',
        },
      });
      return authorization;
    } catch {
      throw new AppError('Not authorized');
    }
  }
}

export default AuthenticateUserService;
