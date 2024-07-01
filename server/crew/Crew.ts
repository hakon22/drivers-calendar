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

const generateScheduleSchema = async (startDate: Dayjs, users: ScheduleSchemaUserType[], numDays: number = 500) => {
  const schedule: ScheduleSchemaType = {};
  if (!users || !users?.length) return schedule;

  const predicate = (i: number) => {
    let result;
    switch (users.length) {
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
        result = 0;
        break;
    }
    return result;
  };

  let currDay = dayjs(startDate);

  for (let i = 0; i < numDays; i += 1) {
    const personIndex = predicate(i);
    schedule[currDay.format('DD-MM-YYYY')] = users[personIndex];
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
      const crew = await Crews.findByPk(crewId);
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      let scheduleSchema = await generateScheduleSchema(startDate, users);
      let shiftOrder: number[] = users.map((user: UserModel) => user.id);

      const reservedDays = (await ReservedDays.findAll({ where: { userId: { [Op.in]: users.map((user) => user.id) } } })) ?? [];
      await Promise.all(reservedDays.map(async ({ reserved_days, userId }) => {
        const reservedDaysDayJs = reserved_days.map((date) => dayjs(date, 'DD-MM-YYYY'));
        const firstShift = dayjs.min(reservedDaysDayJs) as Dayjs;
        const lastShift = dayjs.max(reservedDaysDayJs) as Dayjs;

        if (lastShift.isBefore(dayjs(startDate))) {
          return;
        }

        const lastWorkUsers: ScheduleSchemaUserType[] = [];
        const startDay = dayjs(startDate).isBefore(firstShift) ? firstShift : startDate;

        const range = dateRange(startDay, lastShift);

        for (let i = 1; i <= users.length; i += 1) {
          const candidate = scheduleSchema[dayjs(startDay, 'DD-MM-YYYY').subtract(i, 'day').format('DD-MM-YYYY')];
          if (candidate && candidate.id !== userId) {
            if (dayjs(startDate).isBefore(firstShift)) {
              lastWorkUsers.unshift(candidate);
            } else {
              lastWorkUsers.push(candidate);
            }
          }
        }
        if (lastWorkUsers.length !== users.length) {
          users.forEach((user) => {
            if (!lastWorkUsers.find((usr) => usr.id === user.id) && user.id !== userId) {
              if (dayjs(startDate).isBefore(firstShift)) {
                lastWorkUsers.unshift(user);
              } else {
                lastWorkUsers.push(user);
              }
            }
          });
        }

        const tempSchedule = await generateScheduleSchema(startDay, lastWorkUsers, range.length);

        const {
          id, color, username, phone,
        } = users.find((user) => user.id === userId) as UserModel;

        for (let i = 0; range.length > i; i += 1) {
          scheduleSchema[range[i].format('DD-MM-YYYY')] = tempSchedule[range[i].format('DD-MM-YYYY')];
        }

        const newLastWorkUsers: ScheduleSchemaUserType[] = [];

        for (let i = 0; i <= users.length; i += 1) {
          const candidate = scheduleSchema[dayjs(lastShift, 'DD-MM-YYYY').subtract(i, 'day').format('DD-MM-YYYY')];
          if (candidate && candidate.id !== userId && !newLastWorkUsers.find((usr) => usr?.id === candidate.id)) {
            newLastWorkUsers.unshift(candidate);
          }
        }
        if (newLastWorkUsers.length !== users.length) {
          users.forEach((user) => {
            if (!newLastWorkUsers.find((usr) => usr.id === user.id) && user.id !== userId) {
              newLastWorkUsers.unshift(user);
            }
          });
        }

        newLastWorkUsers.unshift({
          id, color, username, phone,
        } as UserModel);

        const schedule = await generateScheduleSchema(lastShift.add(1, 'day'), newLastWorkUsers as UserModel[]);

        shiftOrder = newLastWorkUsers.map((user) => user.id);

        scheduleSchema = { ...scheduleSchema, ...schedule };
      }));

      await Crews.update({ schedule_schema: scheduleSchema, shiftOrder }, { where: { id: crew.id } });
      return res.json({ code: 1, scheduleSchema });
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
      const {
        dataValues: {
          id, crewId, color, username,
        },
      } = req.user as PassportRequest;
      req.body.firstShift = dayjs(req.body.firstShift);
      req.body.secondShift = dayjs(req.body.secondShift);
      const { firstShift, secondShift, type } = req.body as { firstShift: Dayjs, secondShift: Dayjs, type: 'takeSickLeave' | 'takeVacation' };

      const crew = await Crews.findByPk(crewId, { include: { model: Users, as: 'users' } });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const range = dateRange(dayjs(firstShift), dayjs(secondShift));
      const rangeDateFormat = range.map((date) => date.format('DD-MM-YYYY'));

      const users = crew.shiftOrder.map((number) => {
        if (number !== id) {
          return crew.users?.find((usr) => usr.id === number);
        }
        return undefined;
      }).filter(Boolean);

      const userFirstShiftIndex = range.findIndex((date) => crew.schedule_schema[date.format('DD-MM-YYYY')].id === id);
      if (userFirstShiftIndex === -1) {
        return res.json({ code: 2 });
      }
      const tempSchedule = await generateScheduleSchema(range[0], users as UserModel[], range.length);

      users.unshift({ id, color, username } as UserModel);

      for (let i = 0; range.length > i; i += 1) {
        crew.schedule_schema[range[i].format('DD-MM-YYYY')] = tempSchedule[range[i].format('DD-MM-YYYY')];
      }
      const schedule = await generateScheduleSchema(range[range.length - 1].add(1, 'day'), users as UserModel[]);

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
      const reservedDays = await ReservedDays.findByPk(id);
      if (reservedDays) {
        await ReservedDays.update({ reserved_days: rangeDateFormat }, { where: { userId: id } });
      } else {
        await ReservedDays.create({ userId: id, reserved_days: rangeDateFormat });
      }
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
