import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { classToClass } from 'class-transformer';

export default class UsersController {
  public async create(request: Request, response: Response): Promise<Response> {
    const {
      server_id,
      name,
      description,
      enabled,
      show_in_menu,
    } = request.body;

    // const createCategory = container.resolve(CreateCategoryService);

    // const category = await createCategory.execute({
    //   server_id,
    //   name,
    //   description,
    //   enabled,
    //   show_in_menu,
    // });

    // return response.json(classToClass(category));

    return response.json({ ok: true });
  }
}