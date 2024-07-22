/* eslint-disable @typescript-eslint/no-explicit-any */
import Users from './tables/Users.js';
import Notifications from './tables/Notifications.js';
import Cars from './tables/Cars.js';
import Crews from './tables/Crews.js';
import CrewsCars from './tables/CrewsCars.js';
import ReservedDays from './tables/ReservedDays.js';
import ChatMessages from './tables/ChatMessages.js';
import CompletedShifts from './tables/CompletedShifts.js';

const createRelations = async () => {
  try {
    // почему-то, если нет любого запроса в БД, то foreignKey дублируются каждый запуск приложения
    await Users.sequelize?.query(`
      SELECT id FROM "driver"."users"
    `);
    Users.belongsTo(Crews, { foreignKey: 'crewId' });
    Crews.hasMany(Users, { as: 'users' });
    Crews.hasMany(ChatMessages, { as: 'chat' });
    Crews.belongsTo(Cars, { foreignKey: 'activeCar' });
    CompletedShifts.belongsTo(Users, { foreignKey: 'userId' });
    CompletedShifts.belongsTo(Cars, { foreignKey: 'carId' });
    CompletedShifts.belongsTo(Crews, { foreignKey: 'crewId' });
    Notifications.belongsTo(Users, { foreignKey: 'authorId' });
    Notifications.belongsTo(Users, { foreignKey: 'userId' });
    Notifications.belongsTo(Crews, { foreignKey: 'crewId' });
    ReservedDays.belongsTo(Users, { foreignKey: 'userId' });
    Crews.belongsToMany(Cars, { through: CrewsCars, as: 'cars' });
    Cars.belongsToMany(Crews, { through: CrewsCars, as: 'crews' });
    ChatMessages.belongsTo(Users, { foreignKey: 'authorId', as: 'author' });
    ChatMessages.belongsTo(Crews, { foreignKey: 'crewId' });
  } catch (e) {
    console.log('Невозможно создать связь между таблицами: ', e);
  }
};

export default createRelations;
