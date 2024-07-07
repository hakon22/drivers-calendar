/* eslint-disable no-continue */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { Request, Response } from 'express';
import dayjs, { type Dayjs } from 'dayjs';
import bcrypt from 'bcryptjs';
import { phoneValidation } from '@/validations/validations';
import { Op } from 'sequelize';
import minMax from 'dayjs/plugin/minMax';
import isBetween from 'dayjs/plugin/isBetween';
import _ from 'lodash';
import type { PassportRequest, UserModel } from '../db/tables/Users';
import Crews from '../db/tables/Crews';
import Users from '../db/tables/Users';
import Cars from '../db/tables/Cars';
import type { ScheduleSchemaType, ScheduleSchemaUserType } from '../types/crew/ScheduleSchemaType';
import Notification from '../notification/Notification';
import NotificationEnum from '../types/notification/enum/NotificationEnum';
import phoneTransform from '../utilities/phoneTransform';
import Sms from '../sms/Sms';
import dateRange from '../utilities/dateRange';
import Auth from '../authentication/Auth';
import redis from '../db/redis';
import NotificationType from '../types/notification/NotificationType';
import ReservedDays from '../db/tables/ReservedDays';

dayjs.extend(minMax);
dayjs.extend(isBetween);

const defaultScheduleDays = 500;

const generateScheduleSchema = async (startDate: Dayjs, originalUsers: ScheduleSchemaUserType[], shiftOrder: number[], numDays: number = defaultScheduleDays, oldSchedule: ScheduleSchemaType = {}) => {
  const schedule: ScheduleSchemaType = oldSchedule;
  const users = originalUsers.map(({
    id, username, phone, color,
  }) => ({
    id, username, phone, color,
  }));
  if (!users || !users?.length) return schedule;

  const reservedDays = (await ReservedDays.findAll({ where: { userId: { [Op.in]: shiftOrder } } })) ?? [];

  let iteration = 0;

  let newUsersList: ScheduleSchemaUserType[] = [];
  let lastDaysUser: { lastDay: string, userId: number }[] = [];

  const getLastUsers = (currDay: Dayjs, usersList?: ScheduleSchemaUserType[]) => {
    newUsersList = [];
    for (let i = 1; i <= users.length; i += 1) {
      const candidate = schedule[currDay.subtract(i, 'day').format('DD-MM-YYYY')];
      if (usersList && !usersList.find((user) => user.id === candidate?.id)) {
        continue;
      }
      if (candidate && !newUsersList.find((user) => user.id === candidate.id) && !lastDaysUser.find((usr) => usr.userId === candidate.id)) {
        newUsersList.unshift(candidate);
      } else if (!candidate) {
        const lastDaysUserCopy = [...lastDaysUser];
        const missingUsers = users.filter(({ id }) => !lastDaysUserCopy.find((usr) => usr.userId === id));
        const sortMissingUsers = shiftOrder.map((order) => missingUsers.find((user) => user.id === order) as ScheduleSchemaUserType).filter(Boolean);
        newUsersList = [...sortMissingUsers];
        getLastUsers(currDay, newUsersList);
      }
    }

    if (usersList && newUsersList.length !== usersList.length) {
      const nextDays: string[] = [];

      for (let i = 1; i <= users.length; i += 1) {
        nextDays.push(currDay.add(i, 'day').format('DD-MM-YYYY'));
      }

      const missingUsers = users.filter((user) => (
        !reservedDays.find(({ userId }) => userId === user.id)?.reserved_days.find((day, index) => {
          if (nextDays.includes(day)) {
            return index > nextDays.length;
          }
          return false;
        })
        && !newUsersList.find((usr) => usr.id === user.id)
        && !lastDaysUser.find((usr) => usr.userId === user.id)
      ));
      const sortMissingUsers = shiftOrder.map((order) => missingUsers.find((user) => user.id === order) as ScheduleSchemaUserType).filter(Boolean);
      newUsersList = [...sortMissingUsers, ...newUsersList];
    }
  };

  let currDay = dayjs(startDate);

  const predicate = (i: number) => {
    let result;
    switch (newUsersList.length) {
      case 2:
        result = i % 4 < 2 ? 0 : 1; // 2/2
        break;
      case 3:
        result = i % 3; // 1/2
        break;
      case 4:
        result = i % 4; // 1/3
        break;
      default:
        result = currDay.day() === 0 || currDay.day() === 6 ? -1 : 0; // 5/2
        break;
    }
    return result;
  };

  getLastUsers(currDay); // получаем последних работающих пользователей

  const fillingSchedule = (): ScheduleSchemaUserType => {
    const personIndex = predicate(iteration);
    const lastReservedDays = reservedDays.filter(({ reserved_days }) => currDay.isBetween(dayjs(reserved_days[0], 'DD-MM-YYYY'), dayjs(reserved_days.at(-1), 'DD-MM-YYYY'), 'day', '[]')
    || dayjs(reserved_days.at(-1), 'DD-MM-YYYY').add(1, 'day').isSame(currDay, 'day'));

    const hasReservedDays = lastReservedDays.filter((last) => lastDaysUser.find(({ userId }) => userId === last.userId));
    const hasLastDaysUser = lastReservedDays.map((last) => lastDaysUser.find(({ userId }) => userId === last.userId));
    const returnedUserIds = hasLastDaysUser.filter((lastDayUser) => dayjs(lastDayUser?.lastDay, 'DD-MM-YYYY').add(1, 'day').isSame(currDay, 'day'))
      .map((lastDayUser) => lastDayUser?.userId);

    if (lastReservedDays.length && !_.isEqual(hasReservedDays.map((obj) => _.pick(obj, 'userId')), lastReservedDays.map((obj) => _.pick(obj, 'userId')))) {
      lastReservedDays.forEach((last) => {
        const lastDayUser = lastDaysUser.find(({ userId }) => userId === last.userId);
        if (!lastDayUser) {
          lastDaysUser.push({ lastDay: last.reserved_days.at(-1) as string, userId: last.userId });
          newUsersList = newUsersList.filter((user) => user.id !== last.userId);
        }
      });
      getLastUsers(currDay, newUsersList);
      iteration = 0;
      return fillingSchedule();
    }

    if (hasReservedDays.length && returnedUserIds.length) {
      lastDaysUser = lastDaysUser.filter(({ userId }) => !returnedUserIds.includes(userId));
      iteration = 0;
      getLastUsers(currDay);
      const returnedUsers = shiftOrder.filter((order) => returnedUserIds.includes(order)).map((order) => users.find((user) => user.id === order) as ScheduleSchemaUserType).filter(Boolean);
      newUsersList = newUsersList.filter((user) => !returnedUserIds.includes(user.id));
      returnedUsers.reverse().forEach((returnedUser) => newUsersList.unshift(returnedUser));

      return returnedUsers.at(-1) as ScheduleSchemaUserType;
    }
    return newUsersList[personIndex];
  };

  for (; iteration < numDays; iteration += 1) {
    schedule[currDay.format('DD-MM-YYYY')] = fillingSchedule();
    currDay = currDay.add(1, 'day');
  }

  return schedule;
};

class Crew {
  async fetchCrew(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      const crew = await Crews.findByPk(crewId, {
        include: [
          { attributes: ['id', 'username', 'color', 'phone'], model: Users, as: 'users' },
          { model: Cars, as: 'cars', through: { attributes: [] } }],
      });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }
      return res.json({ code: 1, crew });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async makeSchedule(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      const { startDate, users } = req.body as { startDate: Dayjs, users: UserModel[] };
      const crew = await Crews.findByPk(crewId, { include: { model: Users, as: 'users' } });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const shiftOrder: number[] = users.map((user: UserModel) => user.id);
      const scheduleSchema = await generateScheduleSchema(startDate, users as UserModel[], shiftOrder);

      await Crews.update({ schedule_schema: scheduleSchema, shiftOrder }, { where: { id: crew.id } });
      return res.json({ code: 1, scheduleSchema, shiftOrder });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async activeCarsUpdate(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      const { activeCar } = req.body;

      const crew = await Crews.findByPk(crewId, {
        include: [
          { model: Cars, as: 'cars' }],
      });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const car = await Cars.findByPk(activeCar);
      if (!car) {
        throw new Error('Автомобиль не существует');
      }

      const crews = await Crews.findAll({ where: { activeCar } });
      if (crews.length) {
        return res.json({ code: 3 });
      }
      if (!crew.cars?.find(({ id }) => id === activeCar)) {
        return res.json({ code: 2 });
      }

      await Crews.update({ activeCar }, { where: { id: crew.id } });
      return res.json({ code: 1, activeCar });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async swapShift(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      req.body.firstShift = dayjs(req.body.firstShift);
      req.body.secondShift = dayjs(req.body.secondShift);
      const { firstShift, secondShift } = req.body as { firstShift: Dayjs, secondShift: Dayjs };

      const crew = await Crews.findByPk(crewId);
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const firstUser = crew.schedule_schema[firstShift.format('DD-MM-YYYY')];
      const secondUser = crew.schedule_schema[secondShift.format('DD-MM-YYYY')];

      const preparedNotification = {
        userId: secondUser.id,
        authorId: firstUser.id,
        title: `${firstUser.username} хочет поменяться с вами сменами!`,
        description: `Он выйдет за вас ${secondShift?.locale('ru').format('D MMMM, dddd')}`,
        description2: `Вы за него - ${firstShift?.locale('ru').format('D MMMM, dddd')}`,
        type: NotificationEnum.SHIFT,
        data: req.body,
        isDecision: true,
      };

      const notification = await Notification.create(preparedNotification);
      return res.json({ code: 1, notification });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async takeSickLeaveOrVacation(req: Request, res: Response) {
    try {
      const { dataValues: { id, crewId, username } } = req.user as PassportRequest;
      req.body.firstShift = dayjs(req.body.firstShift);
      req.body.secondShift = dayjs(req.body.secondShift);
      const { firstShift, secondShift, type } = req.body as { firstShift: Dayjs, secondShift: Dayjs, type: 'takeSickLeave' | 'takeVacation' };

      const crew = await Crews.findByPk(crewId, { include: { model: Users, as: 'users' } });
      if (!crew || !crew.users?.length) {
        throw new Error('Экипаж не существует');
      }

      const range = dateRange(dayjs(firstShift), dayjs(secondShift));
      const rangeDateFormat = range.map((date) => date.format('DD-MM-YYYY'));

      const userFirstShiftIndex = range.findIndex((date) => crew.schedule_schema[date.format('DD-MM-YYYY')].id === id);
      if (userFirstShiftIndex === -1) {
        return res.json({ code: 2 });
      }

      const reservedDays = await ReservedDays.findByPk(id);
      if (reservedDays) {
        await ReservedDays.update({ reserved_days: rangeDateFormat }, { where: { userId: id } });
      } else {
        await ReservedDays.create({ userId: id, reserved_days: rangeDateFormat });
      }

      const length = defaultScheduleDays - Object.keys(crew.schedule_schema).findIndex((key) => rangeDateFormat.includes(key));

      const schedule = await generateScheduleSchema(range[0], crew.users as UserModel[], crew.shiftOrder, length, crew.schedule_schema);

      const notifications: NotificationType[] = [];

      crew.users?.forEach(async (user) => {
        const preparedNotification = {
          userId: user.id,
          title: `${username} взял ${type === 'takeSickLeave' ? 'больничный' : 'отпуск'}!`,
          description: `Начало: ${firstShift.locale('ru').format('D MMMM, dddd')}`,
          description2: `Конец: ${secondShift.locale('ru').format('D MMMM, dddd')}`,
          type: type === 'takeSickLeave' ? NotificationEnum.HOSPITAL : NotificationEnum.VACATION,
        };

        const newNotification = await Notification.create(preparedNotification);
        notifications.push(newNotification as NotificationType);
      });

      const scheduleSchema = { ...crew.schedule_schema, ...schedule };

      await Crews.update({ schedule_schema: scheduleSchema }, { where: { id: crewId } });

      return res.json({ code: 1, notifications, scheduleSchema });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async inviteReplacement(req: Request, res: Response) {
    try {
      await phoneValidation.serverValidator(req.body);
      req.body.phone = phoneTransform(req.body.phone);
      const { phone }: { phone: string } = req.body;
      const { dataValues: { id, crewId } } = req.user as PassportRequest;
      const crew = await Crews.findByPk(crewId, {
        include: [
          { attributes: ['username'], model: Users, as: 'users' },
          { attributes: ['brand', 'model', 'call', 'inventory'], model: Cars, as: 'cars' }],
      });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const candidate = await Users.findOne({ where: { phone } });
      if (candidate) {
        if (candidate.crewId) {
          return res.json({ code: 2 });
        }
        const users = crew?.users
          ? crew.users.map(({ username }) => username).join(', ')
          : 'Отсутствуют.';
        const cars = crew?.cars
          ? crew.cars.map(({
            brand, model, inventory, call,
          }) => `${brand} ${model} (${call}/${inventory})`).join(', ')
          : 'Отсутствуют.';
        const preparedNotification = {
          userId: candidate.id,
          authorId: id,
          title: `Вас приглашают в экипаж с графиком ${crew.schedule}`,
          description: `Водители: ${users}`,
          description2: `Автомобили: ${cars}`,
          type: NotificationEnum.INVITE,
          isDecision: true,
        };
        const notification = await Notification.create(preparedNotification);
        return res.json({ code: 1, notification });
      }
      const password = await Sms.sendPass(phone);
      const role = Auth.adminPhone.includes(phone) ? 'admin' : 'member';
      await redis.setEx(phone, 86400, JSON.stringify({
        phone, password: bcrypt.hashSync(password, 10), role, crewId,
      }));

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Crew();
