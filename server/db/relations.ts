/* eslint-disable @typescript-eslint/no-explicit-any */
import Users from './tables/Users.js';
import Notifications from './tables/Notifications.js';
import Cars from './tables/Cars.js';
import Crews from './tables/Crews.js';
import CrewsCars from './tables/CrewsCars.js';
import ReservedDays from './tables/ReservedDays.js';

const createRelations = async () => {
  try {
    // почему-то, если нет любого запроса в БД, то foreignKey дублируются каждый запуск приложения
    await Users.sequelize?.query(`
      SELECT id FROM "driver"."users"
    `);
    Users.belongsTo(Crews, { foreignKey: 'crewId' });
    Crews.hasMany(Users, { as: 'users' });
    Crews.belongsTo(Cars, { foreignKey: 'activeCar' });
    Notifications.belongsTo(Users, { foreignKey: 'authorId' });
    Notifications.belongsTo(Users, { foreignKey: 'userId' });
    Notifications.belongsTo(Crews, { foreignKey: 'crewId' });
    ReservedDays.belongsTo(Users, { foreignKey: 'userId' });
    Crews.belongsToMany(Cars, { through: CrewsCars, as: 'cars' });
    Cars.belongsToMany(Crews, { through: CrewsCars, as: 'crews' });
  } catch (e) {
    console.log('Невозможно создать связь между таблицами: ', e);
  }
};

export default createRelations;
