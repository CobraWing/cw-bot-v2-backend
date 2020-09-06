import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateCustomCommandService from '@modules/commands/services/CreateCustomCommandService';
import GetCustomCommandByIdService from '@modules/commands/services/GetCustomCommandByIdService';

export default class CustomCommandController {
  public async create(request: Request, response: Response): Promise<Response> {
    const {
      category_id,
      name,
      description,
      enabled,
      show_in_menu,
      content,
      image_content,
      image_thumbnail,
    } = request.body;
    const { discordId } = request.guild;
    const { name: updated_by } = request.user;

    const createCustomCommand = container.resolve(CreateCustomCommandService);

    const customCommand = await createCustomCommand.execute({
      discordId,
      category_id,
      name,
      description,
      enabled,
      show_in_menu,
      content,
      image_content,
      image_thumbnail,
      updated_by,
    });

    return response.status(201).json(classToClass(customCommand));
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
}
