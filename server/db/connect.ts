import { Sequelize } from 'sequelize';

const { DB = 'LOCAL', DB_LOCAL = '', DB_HOST = '' } = process.env;

export const db = new Sequelize(DB === 'LOCAL' ? DB_LOCAL : DB_HOST, { schema: 'driver' });

export const connectToDb = async () => {
  try {
    await db.authenticate();
    // await db.sync({ force: true });
    await db.sync();
    console.log('Соединение с БД было успешно установлено');
  } catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e);
  }
};
