import { uuid } from 'uuidv4';

import ICustomCommandRepository from '@modules/commands/repositories/ICustomCommandRepository';
import ICreateCustomCommandDTO from '@modules/commands/dtos/ICreateCustomCommandDTO';

import CustomCommand from '../../entities/CustomCommand';

class FakeCustomCommandRepository implements ICustomCommandRepository {
  private customCommands: CustomCommand[] = [];

  public async create(data: ICreateCustomCommandDTO): Promise<CustomCommand> {
    const customCommand = new CustomCommand();

    Object.assign(customCommand, { id: uuid() }, data);

    this.customCommands.push(customCommand);

    return customCommand;
  }
}

export default FakeCustomCommandRepository;
