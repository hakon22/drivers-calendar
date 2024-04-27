export type User = {
  id?: number;
  username: string;
  password: string;
  color: string;
  phone: string;
  token?: string;
  role: string;
  refresh_token: string[];
};
