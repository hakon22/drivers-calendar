export type LoadingStatus = 'idle' | 'loading' | 'finish' | 'failed';
export type Error = string | null;

export type InitialState = {
  error: Error;
  loadingStatus: LoadingStatus;
};

export type InitialStateType = InitialState & {
  id?: number;
  token?: string;
  refreshToken?: string;
  email?: string;
  username?: string;
  phone?: string;
  key?: string;
  role?: string;
  orders?: number[],
  [key: string]: number[] | string | number | null | undefined;
};
