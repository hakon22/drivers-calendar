import type { InitialState } from '@/types/InitialState';
import { CarModel } from '../../server/db/tables/Cars';
import { UserModel } from '../../server/db/tables/Users';
import CrewScheduleEnum from '../../server/types/crew/enum/CrewScheduleEnum';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';

export type CrewInitialState = InitialState & {
  id?: number;
  schedule?: CrewScheduleEnum;
  shiftOrder: number[];
  schedule_schema: ScheduleSchemaType;
  users: UserModel[];
  cars: CarModel[];
  activeCar: number | null;
  [key: string]: string | number | number[] | null | undefined | UserModel[] | CarModel[] | ScheduleSchemaType;
};
