import { Database } from '@src/config/database/database.service';
import { Model } from '@src/utils/database';
import random from '@src/utils/random';
import { underscore } from '@src/utils/string/inflection';

const setupDatabase = async (db: Database) => {
  await db.sync({ force: true });

  const username = random.name();
  const user = await db
    .model('user')
    .create({ username, password: random.string({ length: 12 }) })
    .then((model: Model<{ id: unknown }>) => model.toJSON());
  await db.model('contact').create({
    email: `${underscore(username)}@eg.com`,
    phone: random.phone(),
    userId: user.id,
  });
};

export { setupDatabase };
