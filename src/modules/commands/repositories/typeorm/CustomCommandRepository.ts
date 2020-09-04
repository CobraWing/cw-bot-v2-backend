import { getRepository, Repository } from 'typeorm';

import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICreateCustomCommandDTO from '@modules/commands/dtos/ICreateCustomCommandDTO';

import CustomCommand from '../../entities/CustomCommand';

class CustomCommandRepository implements ICustomCommandRepository {
  private ormRepository: Repository<CustomCommand>;

  constructor() {
    this.ormRepository = getRepository(CustomCommand);
  }

  public async create(data: ICreateCustomCommandDTO): Promise<CustomCommand> {
    const customCommand = this.ormRepository.create(data);

    await this.ormRepository.save(customCommand);

    return customCommand;
  }
}

export default CustomCommandRepository;
