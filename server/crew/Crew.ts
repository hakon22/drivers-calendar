/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
import { Request, Response } from 'express';
import dayjs, { type Dayjs } from 'dayjs';
import bcrypt from 'bcryptjs';
import { phoneValidation } from '@/validations/validations';
import type { PassportRequest } from '../db/tables/Users';
import Crews, { CrewModel } from '../db/tables/Crews';
import Users from '../db/tables/Users';
import Cars from '../db/tables/Cars';
import type { ScheduleSchemaType } from '../types/crew/ScheduleSchemaType';
import Notification from '../notification/Notification';
import UserNotificationEnum from '../types/notification/enum/NotificationEnum';
import phoneTransform from '../utilities/phoneTransform';
import Sms from '../sms/Sms';
import Auth from '../authentication/Auth';
import redis from '../db/redis';

const generateScheduleSchema = (startDate: Dayjs, numDays: number, users: CrewModel['users']) => {
  const schedule: ScheduleSchemaType = {};
  if (!users) return schedule;

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

  let currDay = startDate;

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
          { model: Cars, as: 'cars' }],
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
      const { startDate, users } = req.body;
      const crew = await Crews.findByPk(crewId);
      if (!crew) {
        throw new Error('Экипаж не существует');
      }
      const scheduleSchema = generateScheduleSchema(dayjs(startDate), 500, users);
      await Crews.update({ schedule_schema: scheduleSchema }, { where: { id: crew.id } });
      return res.json({ code: 1, scheduleSchema });
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
      const { dataValues: { crewId } } = req.user as PassportRequest;
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
          title: `Вас приглашают в экипаж с графиком ${crew.schedule}`,
          description: `Водители: ${users}`,
          description2: `Автомобили: ${cars}`,
          type: UserNotificationEnum.INVITE,
        };
        const notification = await Notification.send(preparedNotification);
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
