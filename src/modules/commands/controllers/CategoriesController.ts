import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';
import log from 'heroku-logger';

import CreateCategoryService from '@modules/commands/services/CreateCategoryService';
import UpdateCategoryService from '@modules/commands/services/UpdateCategoryService';
import ListCategoriesService from '@modules/commands/services/ListCategoriesService';

export default class CategoriesController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, description, enabled, show_in_menu } = request.body;
    const { discordId } = request.guild;

    const createCategory = container.resolve(CreateCategoryService);

    const category = await createCategory.execute({
      discordId,
      name,
      description,
      enabled,
      show_in_menu,
    });

    return response.status(201).json(classToClass(category));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { category_id: categoryId } = request.params;
    const { name, description, enabled, show_in_menu } = request.body;
    const { discordId } = request.guild;

    const updateCategory = container.resolve(UpdateCategoryService);

    const category = await updateCategory.execute({
      categoryId,
      discordId,
      name,
      description,
      enabled,
      show_in_menu,
    });

    return response.json(classToClass(category));
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { name } = request.user;
    const { discordId: discord_id } = request.guild;

    log.info(
      `[CategoriesController.index] find categories by user: ${name} from discord id: ${discord_id}`,
    );

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
