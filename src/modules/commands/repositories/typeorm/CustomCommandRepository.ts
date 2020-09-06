import { getRepository, Repository } from 'typeorm';

import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICreateCustomCommandDTO from '@modules/commands/dtos/ICreateCustomCommandDTO';

import CustomCommand from '../../entities/CustomCommand';

class CustomCommandRepository implements ICustomCommandRepository {
  private ormRepository: Repository<CustomCommand>;

  constructor() {
    this.ormRepository = getRepository(CustomCommand);
  }

  public async findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CustomCommand | undefined> {
    const customCommand = this.ormRepository.findOne({
      where: { id, server_id },
    });

    return customCommand;
  }

  public async create(data: ICreateCustomCommandDTO): Promise<CustomCommand> {
    const customCommand = this.ormRepository.create(data);

    await this.ormRepository.save(customCommand);

    return customCommand;
  }
}

export default CustomCommandRepository;
