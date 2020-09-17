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

  public async update(data: CustomCommand): Promise<CustomCommand> {
    const savedCustomCommand = await this.ormRepository.save(data);

    return savedCustomCommand;
  }

  public async listByServerId(
    server_id: string,
  ): Promise<CustomCommand[] | undefined> {
    const customCommands = await this.ormRepository.find({
      where: { server_id },
      relations: ['category'],
    });

    return customCommands;
  }

  public async listEnabledByServerId(
    server_id: string,
  ): Promise<CustomCommand[] | undefined> {
    const customCommands = await this.ormRepository.find({
      where: { server_id, enabled: true },
      relations: ['category'],
    });

    return customCommands;
  }

  public async deleteByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<void> {
    await this.ormRepository.delete({
      id,
      server_id,
    });
  }
}

export default CustomCommandRepository;
