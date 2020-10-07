import { getRepository, Repository, Not } from 'typeorm';

import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICreateCustomCommandDTO from '@modules/commands/dtos/ICreateCustomCommandDTO';

import CustomCommand from '../../entities/CustomCommand';
import CustomCommandAudit from '../../entities/CustomCommandAudit';

class CustomCommandRepository implements ICustomCommandRepository {
  private ormRepository: Repository<CustomCommand>;

  private ormAuditRepository: Repository<CustomCommandAudit>;

  constructor() {
    this.ormRepository = getRepository(CustomCommand);
    this.ormAuditRepository = getRepository(CustomCommandAudit);
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

    const customCommandSaved = await this.ormRepository.save(customCommand);

    const customCommandAudit = new CustomCommandAudit();
    Object.assign(customCommandAudit, {
      ...customCommandSaved,
    });

    this.ormAuditRepository.save(
      this.ormAuditRepository.create(customCommandAudit),
    );

    return customCommand;
  }

  public async update(data: CustomCommand): Promise<CustomCommand> {
    const savedCustomCommand = await this.ormRepository.save(data);

    const customCommandAudit = new CustomCommandAudit();
    Object.assign(customCommandAudit, {
      ...savedCustomCommand,
    });

    this.ormAuditRepository.save(
      this.ormAuditRepository.create(customCommandAudit),
    );

    return savedCustomCommand;
  }

  public async listByServerId(
    server_id: string,
  ): Promise<CustomCommand[] | undefined> {
    const customCommands = await this.ormRepository.find({
      where: { server_id },
      relations: ['category'],
      order: {
        name: 'ASC',
      },
    });

    return customCommands;
  }

  public async listEnabledByServerId(
    server_id: string,
  ): Promise<CustomCommand[] | undefined> {
    const customCommands = await this.ormRepository
      .createQueryBuilder('custom_commands')
      .leftJoinAndSelect('custom_commands.category', 'category')
      .where('custom_commands.server_id = :server_id', {
        server_id,
      })
      .andWhere('custom_commands.enabled = true')
      .andWhere('category.enabled = true')
      .getMany();

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
