import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

import CreateCategoryService from '@modules/categories/services/CreateCategoryService';
import UpdateCategoryService from '@modules/categories/services/UpdateCategoryService';
import ListCategoriesService from '@modules/categories/services/ListCategoriesService';
import GetCategoryByIdService from '@modules/categories/services/GetCategoryByIdService';
import DeleteCategoryByIdService from '@modules/categories/services/DeleteCategoryByIdService';

export default class CategoriesController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, description, enabled, show_in_menu } = request.body;
    const { discordId } = request.guild;
    const { name: updated_by } = request.user;

    const createCategory = container.resolve(CreateCategoryService);

    const category = await createCategory.execute({
      discordId,
      name,
      description,
      enabled,
      show_in_menu,
      updated_by,
    });

    return response.status(201).json(classToClass(category));
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { category_id: categoryId } = request.params;
    const { name, description, enabled, show_in_menu } = request.body;
    const { discordId } = request.guild;
    const { name: updated_by } = request.user;

    const updateCategory = container.resolve(UpdateCategoryService);

    const category = await updateCategory.execute({
      categoryId,
      discordId,
      name,
      description,
      enabled,
      show_in_menu,
      updated_by,
    });

    return response.json(classToClass(category));
  }

  public async index(request: Request, response: Response): Promise<Response> {
    const { discordId: discord_id } = request.guild;
    const { count } = request.query;

    const listCategory = container.resolve(ListCategoriesService);

    const categories = await listCategory.execute({
      discord_id,
      countCommands: !!count,
    });

    if (categories) {
      return response.json(classToClass(categories));
    }
    return response.status(204).json([]);
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { category_id } = request.params;
    const { discordId: discord_id } = request.guild;

    const getCategoryById = container.resolve(GetCategoryByIdService);

    const category = await getCategoryById.execute({ discord_id, category_id });

    if (category) {
      return response.json(classToClass(category));
    }

    return response.status(404).json();
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { category_id } = request.params;
    const { discordId: discord_id } = request.guild;

    const deleteCategoryByIdService = container.resolve(
      DeleteCategoryByIdService,
    );

    await deleteCategoryByIdService.execute({ discord_id, category_id });

    return response.status(202).json();
  }
}
