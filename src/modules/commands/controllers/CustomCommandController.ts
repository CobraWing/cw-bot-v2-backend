import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateCustomCommandService from '@modules/commands/services/CreateCustomCommandService';

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
}
