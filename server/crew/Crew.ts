/* eslint-disable no-confusing-arrow */
/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-cycle */
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
import type EndWorkShiftFormType from '@/types/EndWorkShiftForm';
import { Result } from '@/components/modals/user/ModalEndWorkShift';
import type { PassportRequest, UserModel } from '../db/tables/Users';
import Crews, { CrewModel } from '../db/tables/Crews';
import Users from '../db/tables/Users';
import Cars from '../db/tables/Cars';
import type { ScheduleSchemaType, ScheduleSchemaUserType } from '../types/crew/ScheduleSchemaType';
import Notification from '../notification/Notification';
import NotificationEnum from '../types/notification/enum/NotificationEnum';
import phoneTransform from '../utilities/phoneTransform';
import Sms from '../sms/Sms';
import dateRange from '../utilities/dateRange';
import redis from '../db/redis';
import NotificationType from '../types/notification/NotificationType';
import ReservedDays from '../db/tables/ReservedDays';
import ReservedDaysTypeEnum from '../types/user/enum/ReservedDaysTypeEnum';
import ChatMessages from '../db/tables/ChatMessages';
import SeasonEnum from '../types/crew/enum/SeasonEnum';
import { socketEventsService } from '../server';
import CompletedShifts from '../db/tables/CompletedShifts';
import truncateLastDecimal from '../utilities/truncateLastDecimal';
import RolesEnum from '../types/user/enum/RolesEnum';

dayjs.extend(minMax);
dayjs.extend(isBetween);

const defaultScheduleDays = 500;
const paginationChatLimit = 100;

const generateScheduleSchema = async (
  startDate: Dayjs | string,
  originalUsers: ScheduleSchemaUserType[],
  shiftOrder: number[],
  numDays: number = defaultScheduleDays,
  oldSchedule: ScheduleSchemaType = {},
  kickedUserId: number | null = null,
) => {
  const schedule: ScheduleSchemaType = oldSchedule;
  const users = originalUsers.map(({ id, color }) => ({ id, color }));
  if (!users || !users?.length) return schedule;

  const reservedDays = (await ReservedDays.findAll({ where: { userId: { [Op.in]: shiftOrder } } })) ?? [];

  let iteration = 0;

  let newUsersList: ScheduleSchemaUserType[] = [];
  let lastDaysUser: { lastDay: string, userId: number }[] = [];

  const getLastUsers = (currDay: Dayjs, usersList?: ScheduleSchemaUserType[]) => {
    newUsersList = [];
    for (let i = 1; i <= 6; i += 1) {
      const candidate = schedule[currDay.subtract(i, 'day').format('DD-MM-YYYY')];
      if (usersList && !usersList.find((user) => user.id === candidate?.id)) {
        continue;
      }
      if (candidate && candidate.id !== kickedUserId && !newUsersList.find((user) => user.id === candidate.id) && !lastDaysUser.find((usr) => usr.userId === candidate.id)) {
        newUsersList.unshift(candidate);
      } else if (!candidate) {
        const lastDaysUserCopy = [...lastDaysUser];
        const missingUsers = users.filter(({ id }) => !lastDaysUserCopy.find((usr) => usr.userId === id) && id);
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
        // result = currDay.day() === 0 || currDay.day() === 6 ? -1 : 0; // 5/2
        result = i % 4 < 2 ? 0 : -1;
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
      if (newUsersList.length !== 1) {
        iteration = 0;
      } else {
        const yesterdayUserId = lastDaysUser.find(({ userId }) => userId === schedule[dayjs(currDay, 'DD-MM-YYYY').subtract(1, 'day').format('DD-MM-YYYY')]?.id)?.userId;
        const beforeYesterdayUserId = lastDaysUser.find(({ userId }) => userId === schedule[dayjs(currDay, 'DD-MM-YYYY').subtract(2, 'day').format('DD-MM-YYYY')]?.id)?.userId;

        if ((_.isEmpty(schedule) && lastDaysUser.find(({ userId }) => userId !== shiftOrder?.[0])) || (yesterdayUserId && beforeYesterdayUserId && yesterdayUserId === beforeYesterdayUserId)) {
          iteration = 0;
        } else if ((Object.keys(schedule).length === 1 && lastDaysUser.find(({ userId }) => userId !== shiftOrder?.[0])) || (beforeYesterdayUserId && !yesterdayUserId)) {
          iteration = 1;
        } else if (!yesterdayUserId && !beforeYesterdayUserId) {
          iteration = 2;
        } else if (yesterdayUserId && !beforeYesterdayUserId) {
          iteration = 3;
        }
      }
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

const sortingSchedule = (schema: ScheduleSchemaType) => {
  const sortedSchedule: ScheduleSchemaType = {};
  if (!schema) return sortedSchedule;

  Object.keys(schema)
    .sort((a, b) => dayjs(a, 'DD-MM-YYYY').isBefore(dayjs(b, 'DD-MM-YYYY')) ? -1 : (dayjs(a, 'DD-MM-YYYY').isAfter(dayjs(b, 'DD-MM-YYYY')) ? 1 : 0))
    .forEach((day) => { sortedSchedule[day] = schema[day]; });
  return sortedSchedule;
};

class Crew {
  async fetchChatMessages(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const limit = paginationChatLimit;
      const offset = req?.query?.offset ? +req.query.offset : 0;

      const { count: total, rows } = await ChatMessages.findAndCountAll({
        where: { crewId },
        attributes: ['id', 'message', 'createdAt', 'readBy'],
        order: [['id', 'DESC']],
        offset,
        limit,
        include: { attributes: ['id', 'username'], model: Users, as: 'author' },
      });

      return res.json({
        code: 1, rows, offset, limit, count: rows.length, total,
      });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async fetchCrew(req: Request, res: Response) {
    try {
      const { dataValues: { crewId, role } } = req.user as PassportRequest;
      const id = req?.query?.id ? +req.query.id : undefined;

      if (id && role !== RolesEnum.ADMIN) {
        return res.sendStatus(403);
      }

      if (!crewId && !id) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const crew = await Crews.findByPk(crewId || id, {
        include: [
          { attributes: ['id', 'username', 'color', 'phone'], model: Users, as: 'users' },
          { model: Cars, as: 'cars', through: { attributes: [] } },
          {
            attributes: ['id', 'message', 'createdAt', 'readBy'], limit: paginationChatLimit, order: [['id', 'DESC']], model: ChatMessages, as: 'chat', include: [{ attributes: ['id', 'username'], model: Users, as: 'author' }],
          },
          {
            model: CompletedShifts, as: 'completedShifts', limit: 50, include: [{ attributes: ['id', 'username'], model: Users, as: 'user' }, { attributes: ['id', 'call'], model: Cars, as: 'car' }],
          },
        ],
      });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }
      if (crewId) {
        const reservedDays = (await ReservedDays.findAll({ where: { userId: { [Op.in]: crew.shiftOrder } } })) ?? [];
        crew.dataValues.reservedDays = reservedDays;
      } else if (id) {
        delete crew.dataValues.chat;
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
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const { startDate, users } = req.body as { startDate: Dayjs, users: UserModel[] };
      const crew = await Crews.findByPk(crewId, { include: { model: Users, as: 'users' } });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const shiftOrder: number[] = users.map((user: UserModel) => user.id);
      const scheduleSchema = await generateScheduleSchema(startDate, users as UserModel[], shiftOrder);

      await Crews.update({ schedule_schema: scheduleSchema, shiftOrder }, { where: { id: crew.id } });

      socketEventsService.socketMakeSchedule({ crewId, scheduleSchema, shiftOrder });

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async activeCarsUpdate(req: Request, res: Response) {
    try {
      const { dataValues: { crewId, role } } = req.user as PassportRequest;
      const paramsCrewId = req?.query?.crewId ? +req.query.crewId : undefined;

      if (!crewId && role !== RolesEnum.ADMIN) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const { activeCar } = req.body;

      const crew = await Crews.findByPk(crewId || paramsCrewId, {
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
      socketEventsService.socketActiveCarUpdate({ crewId: crewId || paramsCrewId, activeCar });

      return res.json({ code: 1, activeCar });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async swapShift(req: Request, res: Response) {
    try {
      const { dataValues: { crewId, username } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

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
        title: `${username} хочет поменяться с вами сменами!`,
        description: `Он выйдет за вас ${secondShift?.locale('ru').format('D MMMM, dddd')}`,
        description2: `Вы за него - ${firstShift?.locale('ru').format('D MMMM, dddd')}`,
        type: NotificationEnum.SHIFT,
        data: req.body,
        isDecision: true,
      };

      const notification = await Notification.create(preparedNotification);
      socketEventsService.socketSendNotification(notification);

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async takeSickLeaveOrVacation(req: Request, res: Response) {
    try {
      const { dataValues: { id, crewId, username } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      req.body.firstShift = dayjs(req.body.firstShift);
      req.body.secondShift = dayjs(req.body.secondShift);
      const { firstShift, secondShift } = req.body as { firstShift: Dayjs, secondShift: Dayjs, type: 'takeSickLeave' | 'takeVacation' };

      const crew = await Crews.findByPk(crewId, { include: { model: Users, as: 'users' } });
      if (!crew || !crew.users?.length) {
        throw new Error('Экипаж не существует');
      }

      const type = req.body.type === 'takeSickLeave' ? ReservedDaysTypeEnum.HOSPITAL : ReservedDaysTypeEnum.VACATION;

      const range = dateRange(dayjs(firstShift), dayjs(secondShift));
      const rangeDateFormat = range.map((date) => date.format('DD-MM-YYYY'));

      const userFirstShiftIndex = range.findIndex((date) => crew.schedule_schema[date.format('DD-MM-YYYY')]?.id === id);
      if (userFirstShiftIndex === -1) {
        return res.json({ code: 2 });
      }

      const reservedDays = await ReservedDays.findByPk(id);
      if (reservedDays) {
        await ReservedDays.update({ reserved_days: rangeDateFormat, type }, { where: { userId: id } });
      } else {
        await ReservedDays.create({ userId: id, reserved_days: rangeDateFormat, type });
      }

      crew.schedule_schema = sortingSchedule(crew.schedule_schema);

      const length = defaultScheduleDays - Object.keys(crew.schedule_schema).findIndex((key) => rangeDateFormat.includes(key));

      const schedule = await generateScheduleSchema(range[0], crew.users as UserModel[], crew.shiftOrder, length, crew.schedule_schema);

      const notifications: NotificationType[] = [];

      await Promise.all((crew.users as UserModel[]).map(async (user) => {
        const preparedNotification = {
          userId: user.id,
          title: `${username} взял ${req.body.type === 'takeSickLeave' ? 'больничный' : 'отпуск'}!`,
          description: `Начало: ${firstShift.locale('ru').format('D MMMM, dddd')}`,
          description2: `Конец: ${secondShift.locale('ru').format('D MMMM, dddd')}`,
          type: req.body.type === 'takeSickLeave' ? NotificationEnum.HOSPITAL : NotificationEnum.VACATION,
        };

        const newNotification = await Notification.create(preparedNotification);
        notifications.push(newNotification as NotificationType);
      }));

      const scheduleSchema = { ...crew.schedule_schema, ...schedule };

      await Crews.update({ schedule_schema: scheduleSchema }, { where: { id: crewId } });

      const newReservedDays = await ReservedDays.findAll();

      notifications.forEach((notif) => socketEventsService.socketSendNotification(notif));
      socketEventsService.socketMakeSchedule({ crewId, scheduleSchema, reservedDays: newReservedDays });

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async cancelSickLeaveOrVacation(req: Request, res: Response) {
    try {
      const { dataValues: { id, crewId, username } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const { type } = req.body as { type: 'cancelSickLeave' | 'cancelVacation' };

      const crew = await Crews.findByPk(crewId, { include: { model: Users, as: 'users' } });
      if (!crew || !crew.users?.length) {
        throw new Error('Экипаж не существует');
      }

      const reservedDays = await ReservedDays.findAll();
      const userReservedDays = reservedDays.find(({ userId }) => userId === id);
      if (!userReservedDays) {
        return res.json({ code: 2 });
      }

      await ReservedDays.destroy({ where: { userId: id } });

      crew.schedule_schema = sortingSchedule(crew.schedule_schema);

      const length = defaultScheduleDays - Object.keys(crew.schedule_schema).findIndex((key) => userReservedDays.reserved_days.includes(key));
      const firstReservedDay = dayjs(userReservedDays.reserved_days[0], 'DD-MM-YYYY');

      const lastWorkDay = dayjs(Object.keys(crew.schedule_schema).reverse().find((day) => (dayjs(day, 'DD-MM-YYYY').isSame(firstReservedDay) || dayjs(day, 'DD-MM-YYYY').isBefore(firstReservedDay)) && crew.schedule_schema[day]?.id === id) ?? firstReservedDay, 'DD-MM-YYYY');

      const startDay = crew.schedule_schema[lastWorkDay.subtract(1, 'day').format('DD-MM-YYYY')]?.id === id
        ? lastWorkDay.subtract(1, 'day')
        : lastWorkDay;

      const schedule = await generateScheduleSchema(startDay, crew.users as UserModel[], crew.shiftOrder, length, crew.schedule_schema);

      const scheduleSchema = { ...crew.schedule_schema, ...schedule };

      const notifications: NotificationType[] = [];

      await Promise.all((crew.users as UserModel[]).map(async (user) => {
        const preparedNotification = {
          userId: user.id,
          title: `${username} отменил ${type === 'cancelSickLeave' ? 'больничный' : 'отпуск'}!`,
          description: `График переделан с ${startDay.locale('ru').format('D MMMM, dddd')}`,
          type: type === 'cancelSickLeave' ? NotificationEnum.HOSPITAL : NotificationEnum.VACATION,
        };

        const newNotification = await Notification.create(preparedNotification);
        notifications.push(newNotification as NotificationType);
      }));

      await Crews.update({ schedule_schema: scheduleSchema }, { where: { id: crewId } });

      socketEventsService.socketMakeSchedule({ crewId, scheduleSchema, reservedDays: reservedDays.filter(({ userId }) => userId !== id) });
      notifications.forEach((notif) => socketEventsService.socketSendNotification(notif));

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async endWorkShift(req: Request, res: Response) {
    try {
      const { dataValues: { id, username, crewId } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const {
        mileageCity = 0, mileageHighway = 0, refueling = 0, downtime = 0,
      } = req.body as EndWorkShiftFormType;

      const crew = await Crews.findByPk(crewId, {
        include: [
          { model: Users, as: 'users' },
          { model: Cars, as: 'cars' },
        ],
      });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const { cars, season, isRoundFuelConsumption } = crew;

      const activeCar = cars?.find((car) => crew.activeCar === car.id);
      if (!activeCar) {
        throw new Error('Нет активного автомобиля');
      }

      const {
        mileage,
        mileage_after_maintenance,
        remaining_fuel,
        fuel_consumption_summer_city,
        fuel_consumption_summer_highway,
        fuel_consumption_winter_city,
        fuel_consumption_winter_highway,
      } = activeCar;

      const fuelConsumptionCity = season === SeasonEnum.SUMMER ? fuel_consumption_summer_city : fuel_consumption_winter_city;
      const fuelConsumptionHighway = season === SeasonEnum.SUMMER ? fuel_consumption_summer_highway : fuel_consumption_winter_highway;

      const newMileage = mileage + mileageCity + mileageHighway;
      const newMileageAfterMaintenance = mileage_after_maintenance + mileageCity + mileageHighway;

      const newFuelConsumptionCity = isRoundFuelConsumption
        ? Math.ceil((mileageCity * fuelConsumptionCity) / 100)
        : truncateLastDecimal(((mileageCity * fuelConsumptionCity) / 100));

      const newFuelConsumptionHighway = isRoundFuelConsumption
        ? Math.ceil((mileageHighway * fuelConsumptionHighway) / 100)
        : truncateLastDecimal(((mileageHighway * fuelConsumptionHighway) / 100));

      const fuelResult = Number(remaining_fuel) - (newFuelConsumptionCity + newFuelConsumptionHighway + downtime) + refueling;

      const newRemainingFuel = isRoundFuelConsumption ? Math.ceil(fuelResult) : truncateLastDecimal(fuelResult);
      const totalFuelConsumption = (isRoundFuelConsumption ? Math.ceil(newFuelConsumptionCity + newFuelConsumptionHighway) : truncateLastDecimal((newFuelConsumptionCity + newFuelConsumptionHighway))) + downtime;

      const result: Omit<Result, 'code'> = {
        mileage: newMileage,
        mileageAfterMaintenance: newMileageAfterMaintenance,
        remainingFuel: newRemainingFuel,
        fuelConsumptionCity: newFuelConsumptionCity,
      };

      if (mileageHighway) {
        result.fuelConsumptionHighway = newFuelConsumptionHighway;
      }
      if (downtime) {
        result.downtime = downtime;
      }
      if (mileageHighway || downtime) {
        result.totalFuelConsumption = totalFuelConsumption;
      }
      if (refueling) {
        result.resultRefueling = refueling;
      }

      const notifications: NotificationType[] = [];

      await Promise.all((crew.users as UserModel[]).map(async (user) => {
        const preparedNotification = {
          userId: user.id,
          title: `${username} закрыл смену ${dayjs().format('DD.MM.YYYY')}`,
          description: `Пробег за смену: ${mileageCity + mileageHighway} км`,
          description2: `Потрачено топлива: ${result.totalFuelConsumption || result.fuelConsumptionCity} л`,
          type: NotificationEnum.CREW,
        };

        const newNotification = await Notification.create(preparedNotification);
        notifications.push(newNotification as NotificationType);
      }));

      const [, affectedRows] = await Cars.update(
        {
          mileage: newMileage,
          mileage_after_maintenance: newMileageAfterMaintenance,
          remaining_fuel: newRemainingFuel,
        },
        { where: { id: activeCar.id }, returning: true },
      );

      const creatededShift = await CompletedShifts.create({
        mileage: newMileage,
        mileageAfterMaintenance: newMileageAfterMaintenance,
        remainingFuel: newRemainingFuel,
        refueling: refueling || undefined,
        userId: id,
        crewId,
        carId: activeCar.id,
      });

      const completedShift = await CompletedShifts.findByPk(creatededShift.id, {
        include: [{ attributes: ['id', 'username'], model: Users, as: 'user' }, { attributes: ['id', 'call'], model: Cars, as: 'car' }],
      });

      socketEventsService.socketCarUpdate({ crewId, car: affectedRows[0] });
      notifications.forEach((notif) => socketEventsService.socketSendNotification(notif));

      socketEventsService.socketCompletedShift(completedShift);

      return res.json({ code: 1, ...result });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async sendMessageToChat(req: Request, res: Response) {
    try {
      const { dataValues: { id, crewId } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const crew = await Crews.findByPk(crewId);
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const created = await ChatMessages.create({ ...req.body, readBy: [id] });
      const message = await ChatMessages.findByPk(created.id, {
        attributes: ['id', 'message', 'crewId', 'createdAt', 'readBy'],
        include: { attributes: ['id', 'username'], model: Users, as: 'author' },
      });

      socketEventsService.socketSendMessageToChat({ crewId, message });

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async readChatMessages(req: Request, res: Response) {
    try {
      const { dataValues: { id, crewId } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const crew = await Crews.findByPk(crewId);
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      const messages = await ChatMessages.findAll({ where: { crewId } });

      const updatedMessage = messages.filter((message) => !message.readBy.includes(id));

      await Promise.all(updatedMessage.map(async (message) => ChatMessages.update({ readBy: [...message.readBy, id] }, { where: { id: message.id } })));

      return res.json({ code: 1 });
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
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

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
          data: crewId,
          isDecision: true,
        };
        const notification = await Notification.create(preparedNotification);
        socketEventsService.socketSendNotification(notification);

        return res.json({ code: 1 });
      }
      const password = await Sms.sendPass(phone);
      const role = RolesEnum.MEMBER;
      await redis.setEx(phone, 86400, JSON.stringify({
        phone, password: bcrypt.hashSync(password, 10), role, crewId,
      }));

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async changeIsRoundFuel(req: Request, res: Response) {
    try {
      const { dataValues: { crewId, role } } = req.user as PassportRequest;
      const { isRoundFuelConsumption }: { isRoundFuelConsumption: boolean } = req.body;
      const paramsCrewId = req?.query?.crewId ? +req.query.crewId : undefined;

      if (!crewId && role !== RolesEnum.ADMIN) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const crew = await Crews.findByPk(crewId || paramsCrewId);
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      await Crews.update({ isRoundFuelConsumption }, { where: { id: crewId || paramsCrewId } });

      socketEventsService.socketChangeIsRoundFuel({ crewId: crewId || paramsCrewId, isRoundFuelConsumption });

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async changeFuelSeason(req: Request, res: Response) {
    try {
      const { dataValues: { crewId, role } } = req.user as PassportRequest;
      const paramsCrewId = req?.query?.crewId ? +req.query.crewId : undefined;

      if (!crewId && role !== RolesEnum.ADMIN) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const { season }: { season: SeasonEnum } = req.body;
      const crew = await Crews.findByPk(crewId || paramsCrewId);
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      await Crews.update({ season }, { where: { id: crewId || paramsCrewId } });

      socketEventsService.socketChangeFuelSeason({ crewId: crewId || paramsCrewId, season });

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async fetchCrewList(req: Request, res: Response) {
    try {
      let crews: CrewModel[];

      const cacheData = await redis.get('adminCrews');
      if (cacheData) {
        crews = JSON.parse(cacheData);
      } else {
        crews = await Crews.findAll({
          include: [
            {
              attributes: ['id', 'username'],
              model: Users,
              as: 'users',
              where: { id: { [Op.ne]: null } },
              required: true,
            },
            {
              model: Cars,
              as: 'cars',
            },
          ],
          order: [['name', 'ASC']],
        });
        await redis.setEx('adminCrews', 300, JSON.stringify(crews));
      }

      return res.json({ code: 1, crews });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async kickReplacement(req: Request, res: Response) {
    try {
      const { dataValues: { id: userId, crewId, username } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }
      const { id = userId } = req.params;

      const crew = await Crews.findByPk(crewId, {
        include: { attributes: ['id', 'username', 'color', 'role'], model: Users, as: 'users' },
      });
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      crew.schedule_schema = sortingSchedule(crew.schedule_schema);

      const user = crew.users?.find((usr) => usr.id === +id);
      if (!user) {
        throw new Error('Пользователь не существует');
      }
      const newUsers = crew.users?.filter((usr) => usr.id !== +id);
      if (user.role === RolesEnum.GRAND_MEMBER && newUsers?.length) {
        await Users.update({ role: RolesEnum.GRAND_MEMBER }, { where: { id: newUsers[0].id } });
      }

      await Users.update({ crewId: null, role: RolesEnum.MEMBER }, { where: { id } });

      socketEventsService.socketKickReplacement({ crewId, userId: +id });
      socketEventsService.socketKickLogout({ userId: id, himSelf: +id === userId });

      const today = dayjs();
      const shift = Object.keys(crew.schedule_schema)
        .map((date) => dayjs(date, 'DD-MM-YYYY'))
        .filter((date) => date.isSame(today, 'day') || date.isAfter(today))
        .sort((a, b) => a.isBefore(b) ? -1 : (a.isAfter(b) ? 1 : 0))
        .find((date) => crew.schedule_schema[dayjs(date).format('DD-MM-YYYY')]?.id === +id);

      const notifications: NotificationType[] = [];

      await Promise.all((crew.users as UserModel[]).map(async (usr) => {
        let preparedNotification;
        if (usr.id === +id && +id !== userId) {
          preparedNotification = {
            userId: +id,
            title: `${username} исключил вас из экипажа`,
            description: 'Вернуться или вступить в экипаж вы можете только по приглашению',
            type: NotificationEnum.CREW,
          };
        } else if (+id !== usr.id) {
          preparedNotification = {
            userId: usr.id,
            title: `${user.username} покидает экипаж`,
            description: shift ? `${user.username} был убран из графика с ${shift.format('DD.MM.YYYY')}` : '',
            description2: `Главным экипажа назначен ${newUsers?.[0].username}`,
            type: NotificationEnum.CREW,
          } as NotificationType;
          if (user.role !== RolesEnum.GRAND_MEMBER) {
            delete preparedNotification.description2;
          }
        }

        if (preparedNotification) {
          const newNotification = await Notification.create(preparedNotification);
          notifications.push(newNotification as NotificationType);
        }
      }));

      if (shift) {
        const shiftOrder = crew.shiftOrder.filter((order) => order !== +id);
        let scheduleSchema;

        if (newUsers?.length === 1) {
          scheduleSchema = Object.fromEntries(Object.entries(crew.schedule_schema).filter(([date, usr]) => !((dayjs(date, 'DD-MM-YYYY').isSame(shift) || dayjs(date, 'DD-MM-YYYY').isAfter(shift)) && usr.id === +id)));
        } else {
          const length = defaultScheduleDays - Object.keys(crew.schedule_schema).findIndex((key) => shift.isSame(dayjs(key, 'DD-MM-YYYY')));
          const schedule = await generateScheduleSchema(shift, newUsers as UserModel[], shiftOrder, length, crew.schedule_schema, +id);
          scheduleSchema = { ...crew.schedule_schema, ...schedule };
        }
        await Crews.update({ schedule_schema: scheduleSchema, shiftOrder }, { where: { id: crew.id } });

        socketEventsService.socketMakeSchedule({ crewId, scheduleSchema, shiftOrder });

        notifications.forEach((notif) => socketEventsService.socketSendNotification(notif));
      }

      return res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Crew();
