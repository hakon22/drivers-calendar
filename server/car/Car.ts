/* eslint-disable import/no-anonymous-default-export */
/* eslint-disable class-methods-use-this */
import { Request, Response } from 'express';
import redis from '../db/redis';
import type { Brand, Models } from '../types/Cars';

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
}

export default new Car();
