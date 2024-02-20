import { Database } from '@src/config/database/database.service';
import { Config } from '@src/config/env/config.service';
import { Models } from '@src/model';
import { Application, Request, Response, asyncHandler } from '@src/utils/application';
import { FindOptions, Model, ModelStatic } from '@src/utils/database';
import { dasherize } from '@src/utils/string/inflection';

type Context = { req: Request; res: Response };

type User = Models['user'];

const Repository =
  <K extends keyof Models, Result>(
    modelName: K,
    injectFn: (model: ModelStatic<Model<Models[K]>>) => Result,
  ) =>
  (ctx: Context) => {
    const db = ctx.req.app.get('Database') as Database;
    const model = db.model(modelName) as ModelStatic<Model<Models[K]>>;
    return injectFn(model);
  };

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

const CreateUserService = Repository('user', (userModel) => {
  return async (user: User) => await userModel.create(user);
});

const GetUserByIdService = Repository('user', (userModel) => {
  return async (id: number) => userModel.findByPk(id);
});

const GetUsersService = Repository('user', (userModel) => {
  return async (filter: FindOptions<User>) => await userModel.findAll(filter);
});

const AddEmailToUser = (model: Model<User>, domainSupplier: () => string) => {
  const user = model.toJSON();
  return { ...user, email: `${dasherize(user.username)}@${domainSupplier()}` };
};

const GetEmailDomainService = Service((ctx) => {
  const config = ctx.req.app.get('Config') as Config;
  return () => `${config.fromEnv('npm_package_name')}.com`;
});

const CreateUserController = Controller(async (ctx) => {
  return CreateUserService(ctx)(ctx.req.body as User);
});

const GetUserByIdController = Controller(async (ctx) => {
  return GetUserByIdService(ctx)(Number(ctx.req.params.userId!));
});

const GetUsersController = Controller(async (ctx) => {
  return GetUsersService(ctx)(ctx.req.query);
});

const GetUsersWithEmailController = Controller(async (ctx) => {
  const users = await GetUsersService(ctx)(ctx.req.query);
  const domainSupplier = GetEmailDomainService(ctx);
  return users.map((user) => AddEmailToUser(user, domainSupplier));
});

const createRoutes = (app: Application) => {
  app.route('/api/v1/users').put(CreateUserController);
  app.route('/api/v1/users').get(GetUsersController);
  app.route('/api/v1/users/:userId').get(GetUserByIdController);
  app.route('/api/v1/usersEmail').get(GetUsersWithEmailController);
};

export { createRoutes };
