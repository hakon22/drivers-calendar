/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dayjs/locale/ru';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import {
  useCallback, useEffect, useMemo, useState,
} from 'react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import {
  ApiContext, AuthContext, ModalContext, ScrollContext, SubmitContext, NavbarContext,
} from '@/components//Context';
import type { ModalShowType, ModalShowObjectType } from '@/types/Modal';
import { socketMakeSchedule } from '@/slices/crewSlice';
import routes from '@/routes';
import { socketSendNotification } from '@/slices/notificationSlice';
import { removeToken } from '@/slices/userSlice';
import favicon from '../images/favicon.ico';
import store from '../slices/index';
import App from '../components/App';
import i18n from '../locales';
import '../scss/app.scss';

const storageKey = process.env.NEXT_PUBLIC_STORAGE_KEY ?? '';
const socket = io(process.env.NODE_ENV === 'development' ? '' : process.env.NEXT_PUBLIC_SOCKET_HOST ?? '');

const Init = (props: AppProps) => {
  const { pageProps, Component } = props;
  const { dispatch } = store;
  const router = useRouter();

  const { id, refreshToken } = store.getState().user;

  const [isSubmit, setIsSubmit] = useState(false); // submit spinner
  const [isActive, setIsActive] = useState(false); // navbar
  const [loggedIn, setLoggedIn] = useState(false); // auth service

  const closeNavbar = () => setIsActive(false);

  const logIn = () => {
    setLoggedIn(true);
    router.push(routes.homePage);
  };
  const logOut = useCallback(async () => {
    const refreshTokenStorage = window.localStorage.getItem(storageKey);
    if (refreshTokenStorage) {
      localStorage.removeItem(storageKey);
    }
    await axios.post(routes.logout, { id, refreshToken });
    if (isActive) {
      closeNavbar();
    }
    dispatch(removeToken());
    setLoggedIn(false);
  }, [id]);

  const [show, setShow] = useState<ModalShowType | ModalShowObjectType>('none'); // modals
  const modalOpen = (arg: ModalShowType, modalSetState?: React.Dispatch<React.SetStateAction<any>>) => (modalSetState ? setShow({ show: arg, modalSetState }) : setShow(arg));
  const modalClose = () => setShow('none');

  const scrollPx = () => window.innerWidth - document.body.clientWidth;

  const [scrollBar, setScrollBar] = useState(0); // фикс прыгающего контента из-за скроллбара
  const setMarginScroll = () => {
    const px = scrollPx();
    if (px) {
      setScrollBar(px - 1);
    } else {
      setScrollBar(px);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      socket.emit('userConnection', id);
      socket.on('makeSchedule', (data) => dispatch(socketMakeSchedule(data)));
      socket.on('sendNotification', (data) => dispatch(socketSendNotification(data)));
    }
  }, [loggedIn]);

  const socketConnect = useCallback((param: string, arg: unknown) => {
    socket.emit(param, arg);
  }, [socket]);

  const socketApi = useMemo(() => ({
    makeSchedule: (data: unknown) => socketConnect('makeSchedule', data),
    sendNotification: (data: unknown) => socketConnect('sendNotification', data),
  }), [socketConnect]);

  const authServices = useMemo(() => ({ loggedIn, logIn, logOut }), [loggedIn]);
  const modalServices = useMemo(() => ({ show, modalOpen, modalClose }), [show]);
  const scrollServices = useMemo(() => ({ scrollBar, setMarginScroll }), [scrollBar]);
  const submitServices = useMemo(() => ({ isSubmit, setIsSubmit }), [isSubmit]);
  const navbarServices = useMemo(() => ({ isActive, setIsActive, closeNavbar }), [isActive]);

  return (
    <I18nextProvider i18n={i18n}>
      <ApiContext.Provider value={socketApi}>
        <AuthContext.Provider value={authServices}>
          <ModalContext.Provider value={modalServices}>
            <ScrollContext.Provider value={scrollServices}>
              <SubmitContext.Provider value={submitServices}>
                <NavbarContext.Provider value={navbarServices}>
                  <Provider store={store}>
                    <Head>
                      <link rel="shortcut icon" href={favicon.src} />
                    </Head>
                    <ToastContainer />
                    <App>
                      <Component {...pageProps} />
                    </App>
                  </Provider>
                </NavbarContext.Provider>
              </SubmitContext.Provider>
            </ScrollContext.Provider>
          </ModalContext.Provider>
        </AuthContext.Provider>
      </ApiContext.Provider>
    </I18nextProvider>
  );
};

export default Init;
