/* eslint-disable import/no-cycle */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import {
  userValidation, carValidation, phoneValidation, confirmCodeValidation,
  userInviteValidation,
} from '@/validations/validations.js';
import dayjs from 'dayjs';
import type { UserSignupType } from '@/components/forms/UserSignup';
import type { UserProfileType } from '@/types/User';
import isOverdueDate from '@/utilities/isOverdueDate.js';
import type { CarType } from '../types/Car.js';
import redis from '../db/redis.js';
import Sms from '../sms/Sms.js';
import phoneTransform from '../utilities/phoneTransform.js';
import Users, { PassportRequest, UserModel } from '../db/tables/Users.js';
import Cars, { CarModel } from '../db/tables/Cars.js';
import Crews from '../db/tables/Crews.js';
import { generateAccessToken, generateRefreshToken, generateTemporaryToken } from './tokensGen.js';
import { upperCase } from '../utilities/textTransform.js';
import Notifications from '../db/tables/Notifications.js';
import SeasonEnum from '../types/crew/enum/SeasonEnum.js';
import ReservedDays from '../db/tables/ReservedDays.js';
import { socketEventsService } from '../server';
import UpdateNotice from '../db/tables/UpdateNotice.js';
import NotificationType from '../types/notification/NotificationType.js';
import Notification from '../notification/Notification.js';
import NotificationEnum from '../types/notification/enum/NotificationEnum.js';

const adminPhone = ['79999999999'];

class Auth {
  public adminPhone = ['79999999999'];

  async signup(req: Request, res: Response) {
    try {
      const { user, car } = req.body as { user: UserSignupType, car: CarType };
      user.phone = phoneTransform(user.phone);
      user.username = upperCase(user.username);
      await userValidation.serverValidator({ ...user });
      await carValidation.serverValidator({ ...car });

      const {
        fuel_consumption_summer, fuel_consumption_winter, inventory, call, ...rest
      } = car;

      const { schedule, color, ...userValues } = user;

      const [isUser, isCar] = await Promise.all([
        Users.findOne({ where: { phone: user.phone } }),
        Cars.findOne({ where: { [Op.or]: [{ inventory }, { call }] } }),
      ]);

      if (isCar) {
        return res.json({ code: 3 });
      }

      if (isUser) {
        return res.json({ code: 2 });
      }

      const password = await Sms.sendPass(user.phone);

      const role = adminPhone.includes(user.phone) ? 'admin' : 'member';

      await Crews.create({
        schedule,
        shiftOrder: [],
        season: SeasonEnum.SUMMER,
        isRoundFuelConsumption: false,
        users: [{
          ...userValues,
          color: typeof color !== 'string' ? color.toHexString() : color,
          role,
          password,
        } as UserModel],
        cars: [{
          ...rest,
          inventory,
          call,
          fuel_consumption_summer_city: fuel_consumption_summer.city,
          fuel_consumption_summer_highway: fuel_consumption_summer.highway,
          fuel_consumption_winter_city: fuel_consumption_winter.city,
          fuel_consumption_winter_highway: fuel_consumption_winter.highway,
        } as CarModel],
      }, { include: [{ model: Users, as: 'users' }, { model: Cars, as: 'cars' }] });

      const createdUser = await Users.findOne({ where: { phone: user.phone } });
      const createdCar = await Cars.findOne({ where: { [Op.and]: [{ inventory }, { call }] } });

      await redis.del(user.phone);

      if (createdUser && createdCar) {
        await Crews.update({ activeCar: createdCar.id }, { where: { id: createdUser.crewId as number } });
      }

      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async login(req: Request, res: Response) {
    try {
      req.body.phone = phoneTransform(req.body.phone);
      const { phone, password } = req.body;
      await phoneValidation.serverValidator({ phone });
      const user = await Users.findOne({ where: { phone } });
      const cacheData = await redis.get(phone);
      if (!user && !cacheData) {
        return res.json({ code: 3 });
      }
      if (cacheData) { // если пришёл по приглашению
        const candidate: { phone: string, password: string, role: string, crewId: number } = JSON.parse(cacheData);
        const isValidPassword = bcrypt.compareSync(password, candidate?.password);
        if (!isValidPassword) {
          return res.json({ code: 2 });
        }
        const crew = await Crews.findByPk(
          candidate.crewId,
          {
            include: [
              { attributes: ['username'], model: Users, as: 'users' },
              { attributes: ['model', 'brand', 'inventory', 'call'], model: Cars, as: 'cars' },
            ],
          },
        );
        if (!crew) {
          throw new Error('Экипаж не существует');
        }
        const users = crew?.users
          ? crew.users.map(({ username }) => username).join(', ')
          : 'Отсутствуют.';
        const cars = crew?.cars
          ? crew.cars.map(({
            brand, model, inventory, call,
          }) => `${brand} ${model} (${call}/${inventory})`).join(', ')
          : 'Отсутствуют.';
        const temporaryToken = generateTemporaryToken(crew.id, phone);
        return res.json({ code: 4, crew: { users, cars }, temporaryToken });
      }
      if (user) {
        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) {
          return res.json({ code: 2 });
        }
        const token = generateAccessToken(user.id, user.phone);
        const refreshToken = generateRefreshToken(user.id, user.phone);
        const {
          id, username, role, refresh_token, crewId, color, isRoundCalendarDays,
        } = user;

        if (refresh_token.length < 4) {
          refresh_token.push(refreshToken);
          await Users.update({ refresh_token }, { where: { phone } });
        } else {
          await Users.update({ refresh_token: [refreshToken] }, { where: { phone } });
        }
        res.status(200).send({
          code: 1,
          user: {
            token, refreshToken, username, role, id, phone, crewId, color, isRoundCalendarDays,
          },
        });
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async inviteSignup(req: Request, res: Response) {
    try {
      const cashData = req.user as PassportRequest;
      req.body.username = upperCase(req.body.username);

      const candidate = { ...cashData, ...req.body } as UserModel;
      await userInviteValidation.serverValidator({ ...candidate });

      const user = await Users.create(candidate, { hooks: false });
      await redis.del(user.phone);

      const token = generateAccessToken(user.id, user.phone);
      const refreshToken = generateRefreshToken(user.id, user.phone);

      const {
        id, username, phone, role, refresh_token, crewId, color, isRoundCalendarDays,
      } = user;

      refresh_token.push(refreshToken);
      await Users.update({ refresh_token }, { where: { phone } });

      res.status(200).send({
        code: 1,
        user: {
          token, refreshToken, username, role, id, phone, crewId, color, isRoundCalendarDays,
        },
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async acceptInvitation(req: Request, res: Response) {
    try {
      const {
        dataValues: {
          id, crewId, username, color, phone,
        },
      } = req.user as PassportRequest;
      const { id: notificationId } = req.body;

      const notification = await Notifications.findByPk(notificationId);
      if (isOverdueDate(notification?.createdAt as Date, 1)) {
        await Notifications.destroy({ where: { id: notificationId } });
        return res.json({ code: 2 });
      }

      if (crewId) {
        return res.json({ code: 3 });
      }

      const crew = await Crews.findByPk(notification?.data as number, {
        include: { attributes: ['id', 'username'], model: Users, as: 'users' },
      });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      await Users.update({ crewId: crew.id }, { where: { id } });

      const notifications: NotificationType[] = [];

      await Promise.all((crew.users as UserModel[]).map(async (user) => {
        const preparedNotification = {
          userId: user.id,
          title: `${username} присоединился к экипажу`,
          description: `Пригласил: ${crew.users?.find((usr) => usr.id === notification?.authorId)?.username}`,
          type: NotificationEnum.CREW,
        };

        const newNotification = await Notification.create(preparedNotification);
        notifications.push(newNotification as NotificationType);
      }));

      socketEventsService.socketAddUserInCrew({
        crewId: crew.id,
        user: {
          id, username, color, phone,
        },
      });

      notifications.forEach((notif) => socketEventsService.socketSendNotification(notif));

      res.status(200).json({ code: 1, crewId: crew.id });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async confirmPhone(req: Request, res: Response) {
    try {
      req.body.phone = phoneTransform(req.body.phone);
      const { phone, key, code: userCode } = req.body as { phone: string, key?: string, code?: string };
      await phoneValidation.serverValidator({ phone });

      const candidate = await Users.findOne({ where: { phone } });
      if (candidate) {
        return res.json({ code: 6 });
      }

      if (key) {
        const cacheData = await redis.get(key);
        const data: { phone: string, code: string, result?: 'done' } | null = cacheData ? JSON.parse(cacheData) : null;

        if (data && data.result === 'done' && data.phone === phone) {
          return res.json({ code: 5 });
        }
        if (key && userCode) {
          await confirmCodeValidation.serverValidator({ code: userCode });
          if (data && data.phone === phone && data.code === userCode) {
            await redis.setEx(key, 300, JSON.stringify({ phone, result: 'done' }));
            return res.json({ code: 2, key });
          }
          return res.json({ code: 3 }); // код подтверждения не совпадает
        }
      }
      if (await redis.exists(phone)) {
        return res.json({ code: 4 });
      }

      const { request_id, code } = await Sms.sendCode(phone);
      await redis.setEx(request_id, 3600, JSON.stringify({ phone, code }));
      await redis.setEx(phone, 59, JSON.stringify({ phone }));

      res.json({ code: 1, key: request_id, phone });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async updateTokens(req: Request, res: Response) {
    try {
      const {
        dataValues: {
          id, username, refresh_token, phone, role, crewId, color, isRoundCalendarDays,
        }, token, refreshToken,
      } = req.user as PassportRequest;
      const oldRefreshToken = req.get('Authorization')?.split(' ')[1] ?? '';
      const isRefresh = refresh_token.includes(oldRefreshToken);
      if (isRefresh) {
        const newRefreshTokens = refresh_token.filter((key: string) => key !== oldRefreshToken);
        newRefreshTokens.push(refreshToken);
        await Users.update({ refresh_token: newRefreshTokens }, { where: { id } });
        const reservedDays = await ReservedDays.findByPk(id);
        if (reservedDays) {
          const isReservedEnd = dayjs(reservedDays.reserved_days.at(-1), 'DD-MM-YYYY').isBefore(dayjs(), 'day');
          if (isReservedEnd) {
            await ReservedDays.destroy({ where: { userId: id } });
          }
        }
      } else {
        throw new Error('Ошибка доступа');
      }
      res.status(200).send({
        code: 1,
        user: {
          id, username, token, refreshToken, role, phone, crewId, color, isRoundCalendarDays,
        },
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(401);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { id, refreshToken } = req.body;
      const user = await Users.findOne({
        attributes: ['refresh_token'],
        where: { id },
      });
      if (user) {
        if (user.refresh_token) {
          const refreshTokens = user.refresh_token.filter((token) => token !== refreshToken);
          await Users.update({ refresh_token: refreshTokens }, { where: { id } });
          res.status(200).json({ status: 'Tokens has been deleted' });
        } else {
          throw new Error();
        }
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async recoveryPassword(req: Request, res: Response) {
    try {
      req.body.phone = phoneTransform(req.body.phone);
      const { phone } = req.body;
      await phoneValidation.serverValidator({ phone });
      const user = await Users.findOne({
        attributes: ['username', 'phone'],
        where: { phone },
      });
      if (!user) {
        return res.status(200).json({ code: 2 });
      }
      const password = await Sms.sendPass(phone);
      const hashPassword = bcrypt.hashSync(password, 10);
      await Users.update({ password: hashPassword }, { where: { phone } });
      res.status(200).json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async fetchUpdates(req: Request, res: Response) {
    try {
      const { dataValues: { id } } = req.user as PassportRequest;

      const allUpdates = await UpdateNotice.findAll({ order: [['id', 'DESC']] });
      const updates = allUpdates.filter(({ readBy }) => !readBy.includes(id));

      res.status(200).json({ code: 1, updates });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async readUpdates(req: Request, res: Response) {
    try {
      const { dataValues: { id: userId } } = req.user as PassportRequest;
      const { id } = req.params;

      const update = await UpdateNotice.findByPk(id);

      if (!update) {
        throw new Error('Уведомление об обновлении не найдено');
      }

      if (update.readBy.includes(userId)) {
        throw new Error('Уведомление об обновлении уже прочитано');
      }

      update.readBy.push(userId);

      await UpdateNotice.update({ readBy: update.readBy }, { where: { id } });

      res.status(200).json({ code: 1, updateId: update.id });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async changeUserProfile(req: Request, res: Response) {
    try {
      const {
        dataValues: {
          id, password, crewId, color,
        },
      } = req.user as PassportRequest;
      const {
        confirmPassword, oldPassword, key, ...values
      } = req.body as UserProfileType;

      if (values.password) {
        if (oldPassword && confirmPassword === values.password) {
          const isValidPassword = bcrypt.compareSync(oldPassword as string, password);
          if (!isValidPassword) {
            return res.json({ code: 2 });
          }
          const hashPassword = bcrypt.hashSync(values.password as string, 10);
          values.password = hashPassword;
        } else {
          throw new Error('Пароль не совпадает или не введён старый пароль');
        }
      }
      if (values?.username) {
        values.username = upperCase(values.username as string);
      }
      if (values.phone) {
        values.phone = phoneTransform(values.phone as string);
        if (key) {
          const cacheData = await redis.get(key as string);
          const data: { phone: string, code: string, result?: 'done' } | null = cacheData ? JSON.parse(cacheData) : null;
          if (data && data.result === 'done' && data.phone === values.phone) {
            await redis.del(data.phone);
            if (values.color && crewId) {
              const crew = await Crews.findByPk(crewId);
              if (!crew) {
                throw new Error('Экипаж не существует');
              }
              Object.keys(crew.schedule_schema).forEach((day) => {
                if (crew.schedule_schema[day]?.color === color) {
                  crew.schedule_schema[day].color = values.color as string;
                }
              });
              await Crews.update({ schedule_schema: crew.schedule_schema }, { where: { id: crewId } });
              socketEventsService.socketMakeSchedule({ crewId, scheduleSchema: crew.schedule_schema });
            }
            await Users.update(values, { where: { id } });
            socketEventsService.socketUserProfileUpdate({ crewId, id, values });
          }
        } else {
          throw new Error('Телефон не подтверждён');
        }
      } else {
        if (values.color && crewId) {
          const crew = await Crews.findByPk(crewId);
          if (!crew) {
            throw new Error('Экипаж не существует');
          }
          Object.keys(crew.schedule_schema).forEach((day) => {
            if (crew.schedule_schema[day]?.color === color) {
              crew.schedule_schema[day].color = values.color as string;
            }
          });
          await Crews.update({ schedule_schema: crew.schedule_schema }, { where: { id: crewId } });
          socketEventsService.socketMakeSchedule({ crewId, scheduleSchema: crew.schedule_schema });
        }
        await Users.update(values, { where: { id } });
        socketEventsService.socketUserProfileUpdate({ crewId, id, values });
      }

      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Auth();
