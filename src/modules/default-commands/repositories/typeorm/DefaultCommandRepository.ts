import { getRepository, Repository } from 'typeorm';

import IDefaultCommandRepository from '../IDefaultCommandRepository';

import DefaultCommand from '../../entities/DefaultCommand';

class DefaultCommandRepository implements IDefaultCommandRepository {
  private ormRepository: Repository<DefaultCommand>;

  constructor() {
    this.ormRepository = getRepository(DefaultCommand);
  }

  public async findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<DefaultCommand | undefined> {
    const defaultCommand = await this.ormRepository
      .createQueryBuilder('default_commands')
      .leftJoinAndSelect(
        'default_commands.server_default_command',
        'server_default_command',
        'server_default_command.default_commands_id = default_commands.id',
      )
      .where('default_commands.server_id = :server_id', {
        server_id,
      })
      .where('default_commands.id = :id', {
        id,
      })
      .getOne();

    return defaultCommand;
  }
}

export default DefaultCommandRepository;
