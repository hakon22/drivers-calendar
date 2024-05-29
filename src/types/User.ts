import { InitialState } from './InitialState';

export type User = {
  id?: number;
  username: string;
  password: string;
  color: string;
  phone: string;
  token?: string;
  role: string;
  refreshToken: string;
};

export type UserInitialState = InitialState & {
  id?: number;
  token?: string;
  refreshToken?: string;
  email?: string;
  username?: string;
  phone?: string;
  key?: string;
  role?: string;
  color?: string;
  crewId?: number;
  [key: string]: number[] | string[] | string | number | null | undefined;
};
