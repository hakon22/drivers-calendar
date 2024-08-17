import { UserSignupType } from '@/components/forms/UserSignup';
import { InitialState } from './InitialState';
import { UpdateNoticeModel } from '../../server/db/tables/UpdateNotice';
import RolesEnum from '../../server/types/user/enum/RolesEnum';

export type User = {
  id?: number;
  username: string;
  password: string;
  color: string;
  phone: string;
  token?: string;
  role: RolesEnum;
  refreshToken: string;
  isRoundCalendarDays: boolean;
  telegramId: number;
};

export type UserInitialState = InitialState & {
  id?: number;
  token?: string;
  refreshToken?: string;
  email?: string;
  username?: string;
  phone?: string;
  key?: string;
  role?: RolesEnum;
  color?: string;
  crewId?: number;
  telegramId?: number;
  isRoundCalendarDays?: boolean;
  updatesNotice?: UpdateNoticeModel[];
  [key: string]: number[] | string[] | UpdateNoticeModel[] | string | number | null | boolean | undefined;
};

export type UserProfileType = Omit<UserSignupType & {
  password?: string;
  confirmPassword?: string;
  oldPassword?: string;
  isRoundCalendarDays: boolean;
  id?: number;
  [key: string]: string | number | boolean | undefined;
}, 'schedule'>;
