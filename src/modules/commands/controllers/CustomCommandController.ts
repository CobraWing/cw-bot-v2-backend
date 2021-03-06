import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateCustomCommandService from '@modules/commands/services/CreateCustomCommandService';
import UpdateCustomCommandService from '@modules/commands/services/UpdateCustomCommandService';
import GetCustomCommandByIdService from '@modules/commands/services/GetCustomCommandByIdService';
import ListCustomCommandService from '@modules/commands/services/ListCustomCommandService';
import DeleteCustomCommandByIdService from '@modules/commands/services/DeleteCustomCommandByIdService';

export default class CustomCommandController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { discordId } = request.guild;
    const { name: updated_by } = request.user;

    const createCustomCommand = container.resolve(CreateCustomCommandService);

    const customCommand = await createCustomCommand.execute({
      ...request.body,
      discordId,
      updated_by,
    });

    return response.status(201).json(classToClass(customCommand));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { discordId } = request.guild;
    const { name: updated_by } = request.user;

    const updateCustomCommand = container.resolve(UpdateCustomCommandService);

    const customCommandUpdated = await updateCustomCommand.execute({
      ...request.body,
      discordId,
      id,
      updated_by,
    });

    return response.json(classToClass(customCommandUpdated));
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { discordId: discord_id } = request.guild;

    const getCustomCommandById = container.resolve(GetCustomCommandByIdService);

    const customCommand = await getCustomCommandById.execute({
      discord_id,
      id,
    });

    if (customCommand) {
      return response.json(classToClass(customCommand));
    }

    return response.status(404).json();
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { discordId: discord_id } = request.guild;

    const listCustomCommand = container.resolve(ListCustomCommandService);

    const customCommands = await listCustomCommand.execute({
      discord_id,
    });

    if (customCommands) {
      return response.json(classToClass(customCommands));
    }
    return response.status(204).json([]);
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const { discordId: discord_id } = request.guild;

    const deleteCustomCommandById = container.resolve(DeleteCustomCommandByIdService);

    await deleteCustomCommandById.execute({ id, discord_id });

    return response.status(202).json();
  }
}
