type FuelConsumptionType = {
  city: number;
  highway: number;
};

export type CarType = {
  brand: string;
  model: string;
  inventory: string;
  call: string;
  mileage: number;
  mileage_after_maintenance: number;
  remaining_fuel: number;
  fuel_consumption_summer: FuelConsumptionType;
  fuel_consumption_winter: FuelConsumptionType;
  crewId: number;
};
