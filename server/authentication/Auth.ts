/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import passGen from 'generate-password';
import { getDigitalCode } from 'node-verification-code';
import {
  userValidation, carValidation, phoneValidation, confirmCodeValidation,
} from '@/validations/validations.js';
import type { UserSignupType } from '@/components/forms/UserSignup';
import type { CarSignupType } from '@/components/forms/CarSignup';
import redis from '../db/redis.js';
import Sms from '../sms/Sms.js';
import phoneTransform from '../utilities/phoneTransform.js';
import Users, { PassportRequest } from '../db/tables/Users.js';
import Cars from '../db/tables/Cars.js';
import { generateAccessToken, generateRefreshToken } from './tokensGen.js';
import { upperCase } from '../utilities/textTransform.js';

const adminPhone = ['+79999999999'];

export const codeGen = () => getDigitalCode(4).toString();

class Auth {
  async signup(req: Request, res: Response) {
    try {
      const { user, car } = req.body as { user: UserSignupType, car: CarSignupType };
      user.phone = phoneTransform(user.phone);
      user.username = upperCase(user.username);
      await userValidation.serverValidator({ ...user });
      await carValidation.serverValidator({ ...car });

      const timeKey = Date.now().toString();
      const code = codeGen();
      await redis.set(timeKey, JSON.stringify({ user, car }), { EX: 3600, NX: true });
      await Sms.sendCode(user.phone, code);

      res.json({ code: 1, key: timeKey });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { phone, password } = req.body;
      const user = await Users.findOne({ where: { phone } });
      if (!user) {
        return res.json({ code: 4 });
      }
      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.json({ code: 3 });
      }
      const token = generateAccessToken(user.id ?? 0, user.phone);
      const refreshToken = generateRefreshToken(user.id ?? 0, user.phone);
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
      const { phone, key, code: userCode } = req.body as { phone: string, key?: string, code?: number };
      await phoneValidation.serverValidator({ phone });

      if (key && userCode) {
        await confirmCodeValidation.serverValidator({ code: userCode });
        const cacheData = await redis.get(key);
        const data: { phone: string, code: string } | null = cacheData ? JSON.parse(cacheData) : null;
        if (!data) {
          req.body.code = null;
          await this.confirmPhone(req, res);
          return;
        }
        if (data.phone === phone && +data.code === userCode) {
          return res.json({ code: 2, key });
        }
        res.json({ code: 3 });
      }

      const code = codeGen();

      const request_id = Date.now().toString();
      console.log(code);
      // const { request_id } = await Sms.sendCode(phoneTransform(phone), code);
      await redis.set(request_id, JSON.stringify({ phone, code }), { EX: 3600, NX: true });

      const response = key ? { code: 1, key: request_id, oldKey: key } : { code: 1, key: request_id };
      res.json(response);
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
      const values = req.body;
      const user = await Users.findOne({
        attributes: ['username', 'phone'],
        where: { phone: values.phone },
      });
      if (!user) {
        return res.status(200).json({ code: 2 });
      }
      const { username, phone } = user;
      const password = passGen.generate({
        length: 7,
        numbers: true,
      });
      const hashPassword = bcrypt.hashSync(password, 10);
      await Users.update({ password: hashPassword }, { where: { phone } });
      // отправляем сообщение в телегу
      res.status(200).json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Auth();
