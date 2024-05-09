/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import {
  userValidation, carValidation, phoneValidation, confirmCodeValidation,
} from '@/validations/validations.js';
import type { UserSignupType } from '@/components/forms/UserSignup';
import type { CarType } from '../types/Car.js';
import redis from '../db/redis.js';
import Sms from '../sms/Sms.js';
import phoneTransform from '../utilities/phoneTransform.js';
import Users, { PassportRequest, UserModel } from '../db/tables/Users.js';
import Cars, { CarModel } from '../db/tables/Cars.js';
import Crews from '../db/tables/Crews.js';
import { generateAccessToken, generateRefreshToken } from './tokensGen.js';
import { upperCase } from '../utilities/textTransform.js';

const adminPhone = ['+79999999999'];

class Auth {
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
      if (!user) {
        return res.json({ code: 3 });
      }
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.json({ code: 2 });
      }
      const token = generateAccessToken(user.id, user.phone);
      const refreshToken = generateRefreshToken(user.id, user.phone);
      const {
        id, username, role, refresh_token,
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
          token, refreshToken, username, role, id, phone,
        },
      });
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
          id, username, refresh_token, phone, role,
        }, token, refreshToken,
      } = req.user as PassportRequest;
      const oldRefreshToken = req.get('Authorization')?.split(' ')[1] ?? '';
      const isRefresh = refresh_token.includes(oldRefreshToken);
      if (isRefresh) {
        const newRefreshTokens = refresh_token.filter((key: string) => key !== oldRefreshToken);
        newRefreshTokens.push(refreshToken);
        await Users.update({ refresh_token: newRefreshTokens }, { where: { id } });
      } else {
        throw new Error('Ошибка доступа');
      }
      res.status(200).send({
        code: 1,
        user: {
          id, username, token, refreshToken, role, phone,
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
}

export default new Auth();
