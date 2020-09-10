import { uuid } from 'uuidv4';

import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICreateCustomCommandDTO from '@modules/commands/dtos/ICreateCustomCommandDTO';

import CustomCommand from '../../entities/CustomCommand';

class FakeCustomCommandRepository implements ICustomCommandRepository {
  private customCommands: CustomCommand[] = [];

  public async findByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<CustomCommand | undefined> {
    return this.customCommands.find(
      customCommand =>
        customCommand.id === id && customCommand.server_id === server_id,
    );
  }

  public async create(data: ICreateCustomCommandDTO): Promise<CustomCommand> {
    const customCommand = new CustomCommand();

    Object.assign(customCommand, { id: uuid() }, data);

    this.customCommands.push(customCommand);

    return customCommand;
  }

  public async update(data: CustomCommand): Promise<CustomCommand> {
    const commandIndex = this.customCommands.findIndex(
      command => command.id === data.id,
    );

    this.customCommands[commandIndex] = data;

    return data;
  }

  public async listByServerId(
    server_id: string,
  ): Promise<CustomCommand[] | undefined> {
    const filteredCustomCommands = this.customCommands.filter(
      command => command.server_id === server_id,
    );

    return filteredCustomCommands;
  }

  public async deleteByIdAndServerId(
    id: string,
    server_id: string,
  ): Promise<void> {
    const customCommandIndex = this.customCommands.findIndex(
      command => command.id === id && command.server_id === server_id,
    );

    this.customCommands.splice(customCommandIndex, 1);
  }
}

export default FakeCustomCommandRepository;
