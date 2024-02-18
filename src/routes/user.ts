import { Database } from '@src/config/database/database.service';
import { Models } from '@src/model';
import { Application, Request, Response, asyncHandler } from '@src/utils/application';
import { FindOptions, Model, ModelStatic } from '@src/utils/database';
import { dasherize } from '@src/utils/string/inflection';

type Context = { req: Request; res: Response };
const Service =
  <Args extends unknown[], Result>(injectFn: (ctx: Context) => (...args: Args) => Result) =>
  (ctx: Context) => {
    return injectFn(ctx);
  };

const Controller = <Result>(fn: (context: Context) => Promise<Result>) =>
  asyncHandler(async (req, res) => {
    const data = await fn({ req, res });
    res.json({ data });
  });

type User = Models['user'];

const CreateUserService = Service((ctx) => {
  const db = ctx.req.app.get('Database') as Database;
  const userModel = db.model('user') as ModelStatic<Model<User>>;
  return async (user: User) => await userModel.create(user);
});

const GetUserByIdService = Service((ctx) => {
  const db = ctx.req.app.get('Database') as Database;
  const userModel = db.model('user') as ModelStatic<Model<User>>;
  return async (id: number) => userModel.findByPk(id);
});

const GetUsersService = Service((ctx) => {
  const db = ctx.req.app.get('Database') as Database;
  const userModel = db.model('user') as ModelStatic<Model<User>>;
  return async (filter: FindOptions<User>) => await userModel.findAll(filter);
});

const AddEmailToUser = (model: Model<User>) => {
  const user = model.toJSON();
  return { ...user, email: `${dasherize(user.username)}@example.com` };
};

const CreateUserController = Controller(async (ctx) => {
  return await CreateUserService(ctx)(ctx.req.body as User);
});

const GetUserByIdController = Controller(async (ctx) => {
  return await GetUserByIdService(ctx)(Number(ctx.req.params.userId!));
});

const GetUsersController = Controller(async (ctx) => {
  return await GetUsersService(ctx)(ctx.req.query);
});

const GetUsersWithEmailController = Controller(async (ctx) => {
  const users = await GetUsersService(ctx)(ctx.req.query);
  return users.map(AddEmailToUser);
});

const createRoutes = (app: Application) => {
  app.route('/api/v1/users').put(CreateUserController);
  app.route('/api/v1/users').get(GetUsersController);
  app.route('/api/v1/users/:userId').get(GetUserByIdController);
  app.route('/api/v1/usersEmail').get(GetUsersWithEmailController);
};

export { createRoutes };
