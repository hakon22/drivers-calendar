import { createContext } from 'react';
import type { ModalShowType, ModalCloseType } from '@/types/Modal';

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
  show: ModalShowType,
  modalShow:(arg?: ModalShowType) => void,
  modalClose: (arg?: ModalCloseType) => void,
    }>({
      show: false,
      modalShow: () => undefined,
      modalClose: () => undefined,
    });

export const ScrollContext = createContext<{
  scrollBar?: number,
  setMarginScroll:() => void,
    }>({
      scrollBar: 0,
      setMarginScroll: () => undefined,
    });
