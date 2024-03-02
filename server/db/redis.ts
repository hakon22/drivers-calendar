import { createClient } from 'redis';
import { readFile } from 'fs/promises';
import type { CarsObjectsType } from '../types/Cars';

const filePath = new URL('../assets/cars.json', import.meta.url);

const redis = await createClient()
  .on('error', (error) => console.log('Невозможно подключиться к Redis', error))
  .connect();

const dataLoad = async () => {
  const carsjson = await readFile(filePath, { encoding: 'utf8' });

  const initialObject: CarsObjectsType = {
    brands: [],
    models: [],
  };

  const carsObjects = JSON.parse(carsjson)
    .reduce((acc: CarsObjectsType, { name, models }: { name: string, models: { name: string }[] }) => {
      acc.brands.push({ value: name, label: name });
      const normalizeModels = models.map((model) => ({ value: model.name, label: model.name }));
      acc.models.push({ value: name, models: normalizeModels });
      return acc;
    }, initialObject);

  await redis.set('carBrands', JSON.stringify(carsObjects.brands));
  await redis.set('carModels', JSON.stringify(carsObjects.models));
};

await dataLoad();

export default redis;
