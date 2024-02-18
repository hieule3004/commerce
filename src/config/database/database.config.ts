import { Database } from '@src/config/database/database.service';

const setupDatabase = async (db: Database) => {
  await db.sync({ force: true });
};

export { setupDatabase };
