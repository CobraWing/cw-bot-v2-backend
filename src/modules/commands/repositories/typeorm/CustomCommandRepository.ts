import { getRepository, Repository, Not } from 'typeorm';

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

  public async findByNameAndServerId(
    name: string,
    server_id: string,
  ): Promise<CustomCommand | undefined> {
    const customCommand = this.ormRepository.findOne({
      where: { name, server_id },
    });

    return customCommand;
  }

  public async findByNotInIdAndNameAndServerId(
    id: string,
    name: string,
    server_id: string,
  ): Promise<CustomCommand | undefined> {
    const commandCategory = this.ormRepository.findOne({
      where: {
        id: Not(id),
        name,
        server_id,
      },
    });

    return commandCategory;
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

  public async countByCategoryId(
    category_id: string,
  ): Promise<[CustomCommand[], number]> {
    return this.ormRepository.findAndCount({
      where: {
        category_id,
      },
    });
  }
}

export default CustomCommandRepository;
