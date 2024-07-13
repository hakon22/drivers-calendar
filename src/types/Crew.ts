import type { InitialState } from '@/types/InitialState';
import { CarModel } from '../../server/db/tables/Cars';
import { UserModel } from '../../server/db/tables/Users';
import CrewScheduleEnum from '../../server/types/crew/enum/CrewScheduleEnum';
import { ScheduleSchemaType } from '../../server/types/crew/ScheduleSchemaType';
import { ReservedDaysModel } from '../../server/db/tables/ReservedDays';
import { ChatMessagesModel } from '../../server/db/tables/ChatMessages';
import PaginationInterface from './PaginationInterface';

export type CrewInitialState = InitialState & {
  id?: number;
  schedule?: CrewScheduleEnum;
  shiftOrder: number[];
  schedule_schema: ScheduleSchemaType;
  users: UserModel[];
  cars: CarModel[];
  reservedDays: ReservedDaysModel[];
  chat: ChatMessagesModel[];
  activeCar: number | null;
  pagination: Omit<PaginationInterface<ChatMessagesModel>, 'rows'>;
  [key: string]: string
    | number
    | number[]
    | null
    | undefined
    | UserModel[]
    | CarModel[]
    | ReservedDaysModel[]
    | ChatMessagesModel[]
    | ScheduleSchemaType
    | Omit<PaginationInterface<ChatMessagesModel>, 'rows'>;
};
