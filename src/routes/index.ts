import { Application } from '@src/utils/application';
import * as userRouter from './user';

const createRoutes = (app: Application) => {
  userRouter.createRoutes(app);
};

export { createRoutes };
