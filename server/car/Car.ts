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
import Cars from '../db/tables/Cars';
import { PassportRequest } from '../db/tables/Users';
import Crews from '../db/tables/Crews';

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
      const cars = await Cars.findAll({ where: { crewId: { [Op.not]: crewId } } });
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
        Cars.findByPk(id),
        Cars.findOne({ where: { [Op.or]: [{ inventory }, { call }], id: { [Op.ne]: id } } }),
      ]);

      if (!car) {
        throw new Error('Автомобиль не существует');
      }
      if (isExist) {
        return res.json({ code: 3 });
      }
      if (crewId !== car.crewId) {
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
      res.json({ code: 1, car: affectedRows[0] });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async removeCar(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      const { id } = req.params;

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
      if (crew.activeCar === +id) {
        return res.json({ code: 3 });
      }
      if (crewId !== car.crewId) {
        return res.json({ code: 2 });
      }
      await Cars.update({ crewId: null }, { where: { id } });
      res.json({ code: 1, carId: id });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }

  async createCar(req: Request, res: Response) {
    try {
      const { dataValues: { crewId } } = req.user as PassportRequest;
      const candidateCar = req.body as CarType;
      await carValidation.serverValidator({ ...candidateCar });

      const {
        fuel_consumption_summer, fuel_consumption_winter, inventory, call, ...rest
      } = candidateCar;

      const isExist = await Cars.findOne({ where: { [Op.or]: [{ inventory }, { call }] } });

      if (isExist) {
        return res.json({ code: 2 });
      }

      const car = await Cars.create(
        {
          ...rest,
          inventory,
          call,
          fuel_consumption_summer_city: fuel_consumption_summer.city,
          fuel_consumption_summer_highway: fuel_consumption_summer.highway,
          fuel_consumption_winter_city: fuel_consumption_winter.city,
          fuel_consumption_winter_highway: fuel_consumption_winter.highway,
          crewId,
        },
      );
      res.json({ code: 1, car });
    } catch (e) {
      console.log(e);
      res.sendStatus(500);
    }
  }
}

export default new Car();
