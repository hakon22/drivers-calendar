/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext } from 'react';
import type { ModalShowType, ModalShowObjectType } from '@/types/Modal';

export const ApiContext = createContext<{
  [key: string]:(data: unknown) => void,
    }>({});

export const AuthContext = createContext<{
  loggedIn: boolean,
  logIn:() => void,
  logOut: () => Promise<void>,
    }>({
      loggedIn: false,
      logIn: () => undefined,
      logOut: async () => undefined,
    });

export const ModalContext = createContext<{
  show: ModalShowType | ModalShowObjectType,
  modalOpen:(arg: ModalShowType, modalSetState?: React.Dispatch<React.SetStateAction<any>>) => void,
  modalClose:() => void,
    }>({
      show: 'none',
      modalOpen: (arg) => arg,
      modalClose: () => 'none',
    });

export const ScrollContext = createContext<{
  scrollBar?: number,
  setMarginScroll:() => void,
    }>({
      scrollBar: 0,
      setMarginScroll: () => undefined,
    });
