export type Brand = { value: string, label: string };

export type Models = { value: string, models: Brand[] };

export type CarsObjectsType = {
  brands: Brand[],
  models: Models[],
};
