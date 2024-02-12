import { Database } from '@src/config/database/database.service';
import { Application, RequestHandler } from '@src/utils/application/index';
import { Model, ModelStatic, WhereOptions } from '@src/utils/database';
import * as path from '@src/utils/node/path';
import { camelize, pluralize, singularize } from '@src/utils/string/inflection';

type AssociationType = 'one' | 'many';

const repositoryMethodMap = {
  find: 'get',
  create: 'put',
  update: 'patch',
  delete: 'delete',
} as const;

function createRepository<T extends object>(model: ModelStatic<Model<T, T>>) {
  const repository: Record<AssociationType, Repository> = { one: {}, many: {} };

  const name = singularize(model.tableName);
  const pKey = model.primaryKeyAttribute;
  const pKeyC = camelize(pKey);
  const associations = Object.values(model.associations)
    .filter((a) => a.associationType.startsWith('Has'))
    .map((a) => ({
      associationType: camelize(a.associationType.substring('Has'.length), true) as AssociationType,
      resourceName: a.as,
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

  repository.many.create = (_: Record<string, unknown>, value: T) => model.create(value as never);
  repository.many.find = (_: Record<string, unknown>, filter: object) => model.findAll(filter);
  repository.many[`findBy${pKeyC}`] = (attrs: Record<string, unknown>) =>
    model.findOne({ include: { all: true }, where: where<T>(attrs) });
  repository.many[`updateBy${pKeyC}`] = (attrs: Record<string, unknown>, value: Partial<T>) =>
    model.update(value, { where: where(attrs) });
  repository.many[`deleteBy${pKeyC}`] = (attrs: Record<string, unknown>) =>
    model.destroy({ where: where(attrs) });

  repository.one.find = (attrs: Record<string, unknown>) =>
    model.findOne({ include: { all: true }, where: where<T>(attrs) });
  repository.one.update = (attrs: Record<string, unknown>, value: Partial<T>) =>
    model.update(value, { where: where(attrs) });
  repository.one.delete = (attrs: Record<string, unknown>) =>
    model.destroy({ where: where(attrs) });

  return { repository, associations };
}

type Repository = Record<string, (...args: never[]) => Promise<unknown>>;

function configureRoute(
  repository: Repository,
  resourceName: string,
  associationType: AssociationType = 'many',
  prefix = '/',
) {
  const mainRoute = path.join(
    prefix,
    associationType === 'many' ? pluralize(resourceName) : resourceName,
  );

  const router = (app: Application) => {
    for (const [key, action] of Object.entries(repository)) {
      const [command, attr] = key.split('By');
      const method = repositoryMethodMap[command as keyof typeof repositoryMethodMap];
      const route = attr ? path.join(mainRoute, `:${resourceName}${camelize(attr)}`) : mainRoute;

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
const createRouter = (
  repositories: Record<string, ReturnType<typeof createRepository>>,
  globalPrefix = '/',
) =>
  function getRouteFunctions(
    modelName: string,
    resourceName = modelName,
    type: AssociationType = 'many',
    prefix = globalPrefix,
  ): Router[] {
    const { repository, associations } = repositories[modelName]!;

    const { router, mainRoute } = configureRoute(repository[type], resourceName, type, prefix);
    const associationRoute = path.join(mainRoute, `:${resourceName}Id`);

    const nestedRouters = associations.flatMap((r) =>
      getRouteFunctions(r.modelName, r.resourceName, r.associationType, associationRoute),
    );

    return [router, ...nestedRouters];
  };

const configureModelRoutes = (app: Application) => {
  const db = app.get('Database') as Database;
  const apiPrefix = (app.get('ApiPrefix') ?? '/') as string;

  const repositories = Object.entries(db.models).reduce(
    (target, [modelName, model]) => {
      target[modelName] = createRepository(model);
      return target;
    },
    {} as Record<string, ReturnType<typeof createRepository>>,
  );
  const getRouterFunction = createRouter(repositories, apiPrefix);
  const fns = Object.keys(repositories).flatMap((modelName) => getRouterFunction(modelName));
  for (const routerFn of fns) routerFn(app);
};

export { configureModelRoutes };
