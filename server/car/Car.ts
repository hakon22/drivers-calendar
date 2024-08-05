/* eslint-disable import/no-cycle */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import { carValidation } from '@/validations/validations';
import { Op } from 'sequelize';
import redis from '../db/redis';
import type { Brand, Models } from '../types/Cars';
import { CarType } from '../types/Car';
import Cars, { CarModel } from '../db/tables/Cars';
import { PassportRequest } from '../db/tables/Users';
import Crews from '../db/tables/Crews';
import CrewsCars from '../db/tables/CrewsCars';
import { socketEventsService } from '../server';

class Car {
  async fetchBrands(req: Request, res: Response) {
    try {
      const cacheCarBrands = await redis.get('carBrands');
      if (cacheCarBrands) {
        const carBrands: Brand[] = JSON.parse(cacheCarBrands);
        res.json(carBrands);
      } else {
        throw Error('проверьте подключение к Redis');
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async fetchCarList(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      const [cars] = await Cars.sequelize?.query(`
        SELECT "cars"."id",
          "cars"."brand",
          "cars"."model",
          "cars"."inventory",
          "cars"."call"
        FROM "driver"."cars" AS "cars"
        LEFT JOIN "driver"."crews_cars" AS "crewsCars" ON "cars"."id" = "crewsCars"."carId"
        LEFT JOIN "driver"."crews" AS "crews" ON "crewsCars"."crewId" = "crews"."id" AND "crews"."id" != ${crewId}
        WHERE
          ("crews"."activeCar" != "cars"."id" OR "crewsCars"."carId" IS NULL)
          AND NOT EXISTS (
            SELECT 1
            FROM "driver"."crews_cars" AS "crewsCars"
            WHERE "crewsCars"."carId" = "cars"."id" AND "crewsCars"."crewId" = ${crewId}
          )
      `) as CarModel[][];
      const preparedCars = cars.map(({
        id, brand, model, inventory, call,
      }) => ({ label: `${brand} ${model} (${call}/${inventory})`, value: `${brand} ${model} (${call}/${inventory})`, id }));
      res.json({ code: 1, cars: preparedCars });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async getModels(req: Request, res: Response) {
    try {
      const { brand } = req.params;
      const cacheCarModels = await redis.get('carModels');
      if (cacheCarModels) {
        const carModels: Models[] = JSON.parse(cacheCarModels);
        const searchedModels = carModels.find(({ value }) => value === brand)?.models;
        res.json(searchedModels);
      } else {
        throw Error('проверьте подключение к Redis');
      }
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async updateCar(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      const { id } = req.params;
      const updatedCar = req.body as CarType;
      await carValidation.serverValidator({ ...updatedCar });

      const {
        fuel_consumption_summer, fuel_consumption_winter, inventory, call, ...rest
      } = updatedCar;

      const [car, isExist] = await Promise.all([
        Cars.findByPk(id, { include: { model: Crews, as: 'crews', where: { id: crewId } } }),
        Cars.findOne({ where: { [Op.or]: [{ inventory }, { call }], id: { [Op.ne]: id } } }),
      ]);

      if (!car) {
        throw new Error('Автомобиль не существует');
      }
      if (isExist) {
        return res.json({ code: 3 });
      }
      if (!car.crews?.find((crew) => crew.id === crewId)) {
        return res.json({ code: 2 });
      }
      const [, affectedRows] = await Cars.update(
        {
          ...rest,
          inventory,
          call,
          fuel_consumption_summer_city: fuel_consumption_summer.city,
          fuel_consumption_summer_highway: fuel_consumption_summer.highway,
          fuel_consumption_winter_city: fuel_consumption_winter.city,
          fuel_consumption_winter_highway: fuel_consumption_winter.highway,
        },
        { where: { id }, returning: true },
      );
      socketEventsService.socketCarUpdate({ crewId, car: affectedRows[0] });

      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async removeCar(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const { id } = req.params;

      const [car, crew] = await Promise.all([
        Cars.findByPk(id, { include: { model: Crews, as: 'crews', where: { id: crewId } } }),
        Crews.findByPk(crewId),
      ]);

      if (!car) {
        throw new Error('Автомобиль не существует');
      }
      if (!crew) {
        throw new Error('Экипаж не существует');
      }
      if (crew.activeCar === +id) {
        return res.json({ code: 3 });
      }
      if (!car.crews?.find((_crew) => _crew.id === crewId)) {
        return res.json({ code: 2 });
      }
      await CrewsCars.destroy({ where: { carId: id, crewId } });
      socketEventsService.socketCarRemove({ crewId, carId: id });

      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async createCar(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const candidateCar = req.body as CarType;
      await carValidation.serverValidator({ ...candidateCar });

      const {
        fuel_consumption_summer, fuel_consumption_winter, inventory, call, ...rest
      } = candidateCar;

      const isExist = await Cars.findOne({ where: { [Op.or]: [{ inventory }, { call }] } });

      if (isExist) {
        return res.json({ code: 2 });
      }

      const car = await Cars.create({
        ...rest,
        inventory,
        call,
        fuel_consumption_summer_city: fuel_consumption_summer.city,
        fuel_consumption_summer_highway: fuel_consumption_summer.highway,
        fuel_consumption_winter_city: fuel_consumption_winter.city,
        fuel_consumption_winter_highway: fuel_consumption_winter.highway,
      });

      await CrewsCars.create({ carId: car.id, crewId });
      socketEventsService.socketCarAdd({ crewId, car });

      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async addCar(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      if (!crewId) {
        throw new Error('Пользователь не состоит в экипаже');
      }

      const { id } = req.body as { id: number };

      const [car, crew] = await Promise.all([
        Cars.findByPk(id),
        Crews.findByPk(crewId),
      ]);

      if (!car) {
        throw new Error('Автомобиль не существует');
      }
      if (!crew) {
        throw new Error('Экипаж не существует');
      }

      await CrewsCars.create({ crewId, carId: car.id });
      socketEventsService.socketCarAdd({ crewId, car });

      res.json({ code: 1 });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Car();
