import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateCategoryService from '@modules/commands/services/CreateCategoryService';
import ListCategoriesService from '@modules/commands/services/ListCategoriesService';

export default class UsersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { server_id, name, description, show_in_menu } = request.body;

    const createCategory = container.resolve(CreateCategoryService);

    const category = await createCategory.execute({
      server_id,
      name,
      description,
      show_in_menu,
    });

    return response.json(classToClass(category));
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { discordId: discord_id } = request.guild;

    const listCategory = container.resolve(ListCategoriesService);

    const categories = await listCategory.execute({
      discord_id,
    });

    if (categories) {
      return response.json(classToClass(categories));
    }
    return response.status(204).json([]);
  }
}
