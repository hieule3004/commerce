import path from 'node:path';
import { camelize, pluralize, singularize } from 'inflection';
import { Application, RequestHandler } from '@src/utils/application/index';
import { Database, Model, ModelStatic, WhereOptions } from '@src/utils/database';

const repositoryMethodMap = {
  find: 'get',
  create: 'put',
  update: 'patch',
  delete: 'delete',
} as const;

function createRepository<T extends object>(model: ModelStatic<Model<T, T>>) {
  const manyRepository: Repository = {};
  const oneRepository: Repository = {};

  const name = singularize(model.tableName);
  const pKey = model.primaryKeyAttribute;
  const pKeyC = camelize(pKey);
  const associations = Object.values(model.associations)
    .filter((a) => a.associationType.startsWith('Has'))
    .map((a) => ({
      type: camelize(a.associationType.substring('Has'.length), true),
      name: a.as,
      modelName: a.target.name,
    }));

  const where = <T extends object>(attrs: Record<string, unknown>) => {
    const where = { ...attrs };
    if (where[`${name}${pKeyC}`]) {
      where[pKey] = where[`${name}${pKeyC}`];
      delete where[`${name}${pKeyC}`];
    }
    return where as WhereOptions<T>;
  };

  manyRepository.create = (_: Record<string, unknown>, value: T) => model.create(value as never);
  manyRepository.find = (_: Record<string, unknown>, filter: object) => model.findAll(filter);
  manyRepository[`findBy${pKeyC}`] = (attrs: Record<string, unknown>) =>
    model.findOne({ include: { all: true }, where: where<T>(attrs) });
  manyRepository[`updateBy${pKeyC}`] = (attrs: Record<string, unknown>, value: Partial<T>) =>
    model.update(value, { where: where(attrs) });
  manyRepository[`deleteBy${pKeyC}`] = (attrs: Record<string, unknown>) =>
    model.destroy({ where: where(attrs) });

  oneRepository.find = (attrs: Record<string, unknown>) =>
    model.findOne({ include: { all: true }, where: where<T>(attrs) });
  oneRepository.update = (attrs: Record<string, unknown>, value: Partial<T>) =>
    model.update(value, { where: where(attrs) });
  oneRepository.delete = (attrs: Record<string, unknown>) => model.destroy({ where: where(attrs) });

  return { repository: { many: manyRepository, one: oneRepository }, associations };
}

type Repository = Record<string, (...args: never[]) => Promise<unknown>>;

function configureRoute(
  repository: Repository,
  name: string,
  type: 'one' | 'many' = 'many',
  prefix = '/',
) {
  const mainRoute = path.join(prefix, type === 'many' ? pluralize(name) : name);

  const router = (app: Application) => {
    for (const [key, action] of Object.entries(repository)) {
      const [command, attr] = key.split('By');
      const method = repositoryMethodMap[command as keyof typeof repositoryMethodMap];
      const route = attr ? path.join(mainRoute, `:${name}${camelize(attr)}`) : mainRoute;

      app.route(route)[method]((async (req, res) => {
        const result = await action(
          ...([req.params, method === 'get' ? req.query : req.body] as never[]),
        )
          .then((data) => ({ data }))
          .catch((error: unknown) => ({ error }));
        res.json(result);
      }) as RequestHandler);
    }
  };

  return { router, mainRoute };
}

type Router = ReturnType<typeof configureRoute>['router'];
const createRouter =
  (repositories: Record<string, ReturnType<typeof createRepository>>) =>
  (name: string, modelName = name, type: 'one' | 'many' = 'many', prefix = '/') => {
    const routers = Array<Router>();

    const { repository, associations } = repositories[modelName]!;

    const { router, mainRoute } = configureRoute(repository[type], name, type, prefix);
    routers.push(router);

    const associationRoute = path.join(mainRoute, `:${name}Id`);
    for (const { name, modelName, type } of associations) {
      const associationRouters = createRouter(repositories)(
        name,
        modelName,
        type as 'one' | 'many',
        associationRoute,
      );
      routers.push(...associationRouters);
    }
    return routers;
  };

const configureModelRoutes = (app: Application) => {
  const db = app.get('Database') as Database;

  const repositories = Object.entries(db.models).reduce(
    (target, [modelName, model]) => {
      target[modelName] = createRepository(model);
      return target;
    },
    {} as Record<string, ReturnType<typeof createRepository>>,
  );
  const getRouterFunction = createRouter(repositories);
  const fns = Object.keys(repositories).flatMap((modelName) => getRouterFunction(modelName));
  for (const routerFn of fns) routerFn(app);
};

export { configureModelRoutes };
