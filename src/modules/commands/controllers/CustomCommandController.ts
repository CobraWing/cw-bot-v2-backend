import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateCustomCommandService from '@modules/commands/services/CreateCustomCommandService';
import UpdateCustomCommandService from '@modules/commands/services/UpdateCustomCommandService';
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

  public async update(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;
    const {
      category_id,
      enabled,
      show_in_menu,
      name,
      description,
      content,
      image_content,
      image_thumbnail,
      embedded,
      color,
      footer_text,
      role_limited,
      role_blacklist,
      role_whitelist,
      channel_limited,
      channel_blacklist,
      channel_whitelist,
    } = request.body;
    const { discordId } = request.guild;
    const { name: updated_by } = request.user;

    const updateCustomCommand = container.resolve(UpdateCustomCommandService);

    const customCommandUpdated = await updateCustomCommand.execute({
      discordId,
      id,
      category_id,
      enabled,
      show_in_menu,
      name,
      description,
      content,
      image_content,
      image_thumbnail,
      embedded,
      color,
      footer_text,
      role_limited,
      role_blacklist,
      role_whitelist,
      channel_limited,
      channel_blacklist,
      channel_whitelist,
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
}
