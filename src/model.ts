import { pluralize } from 'inflection';
import { DataTypes, Database, Model } from '@src/utils/database';

const configureModels = (db: Database) => {
  type User = { username: string; password: string };
  const UserModel = db.define<Model<User>>('user', {
    username: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
  });

  type Contact = { phone: string; email: string; userId: number };
  const ContactModel = db.define<Model<Contact>>('contact', {
    email: { type: DataTypes.STRING, unique: true },
    phone: DataTypes.STRING,
    userId: { type: DataTypes.INTEGER, references: { model: pluralize('user'), key: 'id' } },
  });

  UserModel.hasOne(ContactModel, { as: 'contactInfo', foreignKey: 'userId' });
};

export { configureModels };
