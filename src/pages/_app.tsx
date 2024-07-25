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
  AuthContext, ModalContext, ScrollContext, SubmitContext, NavbarContext,
} from '@/components/Context';
import type { ModalShowType, ModalShowObjectType } from '@/types/Modal';
import {
  socketMakeSchedule, socketActiveCarsUpdate, socketCarUpdate, socketCarAdd, fetchCrew, socketCarRemove, socketSwipShift, socketSendMessageToChat,
  removeToken as crewRemoveToken, socketChangeFuelSeason, socketChangeIsRoundFuel, socketUserProfileUpdateCrew, socketCompletedShift,
} from '@/slices/crewSlice';
import routes from '@/routes';
import { fetchNotifications, socketSendNotification, removeToken as notifRemoveToken } from '@/slices/notificationSlice';
import { removeToken, socketUserProfileUpdate } from '@/slices/userSlice';
import favicon16 from '../images/favicon16x16.png';
import favicon32 from '../images/favicon32x32.png';
import favicon57 from '../images/favicon57x57.png';
import favicon180 from '../images/favicon180x180.png';
import store from '../slices/index';
import App from '../components/App';
import i18n from '../locales';
import '../scss/app.scss';
import SocketEventEnum from '../../server/types/notification/enum/SocketEventEnum';

const storageKey = process.env.NEXT_PUBLIC_STORAGE_KEY ?? '';
const socket = io(process.env.NODE_ENV === 'development' ? '' : process.env.NEXT_PUBLIC_SOCKET_HOST ?? '', { transports: ['websocket', 'polling'] });

const Init = (props: AppProps) => {
  const { pageProps, Component } = props;
  const { dispatch } = store;
  const router = useRouter();

  const { id, refreshToken, crewId } = store.getState().user;

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
    socket.disconnect();
    socket.removeAllListeners();
    setLoggedIn(false);
    dispatch(removeToken());
    dispatch(crewRemoveToken());
    dispatch(notifRemoveToken());
  }, [id]);

  const [show, setShow] = useState<ModalShowType | ModalShowObjectType>('none'); // modals
  const modalOpen = (arg: ModalShowType, modalSetState?: React.Dispatch<React.SetStateAction<any>>, modalContext?: number | string) => {
    if (modalSetState) {
      setShow({ show: arg, modalSetState });
    } else if (modalContext) {
      setShow({ show: arg, modalContext });
    } else {
      setShow(arg);
    }
  };
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
      if (socket.disconnected) {
        socket.connect();
      }
      dispatch(fetchNotifications());
      socket.emit(SocketEventEnum.USER_CONNECTION, id);
      socket.on(SocketEventEnum.MAKE_SCHEDULE, (data) => dispatch(socketMakeSchedule(data)));
      socket.on(SocketEventEnum.SEND_NOTIFICATION, (data) => dispatch(socketSendNotification(data)));
      socket.on(SocketEventEnum.ACTIVE_CAR_UPDATE, (data) => dispatch(socketActiveCarsUpdate(data)));
      socket.on(SocketEventEnum.CAR_UPDATE, (data) => dispatch(socketCarUpdate(data)));
      socket.on(SocketEventEnum.CAR_REMOVE, (data) => dispatch(socketCarRemove(data)));
      socket.on(SocketEventEnum.CAR_ADD, (data) => dispatch(socketCarAdd(data)));
      socket.on(SocketEventEnum.SWIP_SHIFT, (data) => dispatch(socketSwipShift(data)));
      socket.on(SocketEventEnum.SEND_MESSAGE_TO_CHAT, (data) => dispatch(socketSendMessageToChat(data)));
      socket.on(SocketEventEnum.CHANGE_IS_ROUND_FUEL, (data) => dispatch(socketChangeIsRoundFuel(data)));
      socket.on(SocketEventEnum.CHANGE_FUEL_SEASON, (data) => dispatch(socketChangeFuelSeason(data)));
      socket.on(SocketEventEnum.COMPLETED_SHIFT, (data) => dispatch(socketCompletedShift(data)));
      socket.on(SocketEventEnum.USER_PROFILE_UPDATE, (data) => {
        if (crewId) {
          dispatch(socketUserProfileUpdateCrew(data));
        }
        dispatch(socketUserProfileUpdate(data));
      });
    }
  }, [loggedIn]);

  useEffect(() => {
    if (crewId) {
      dispatch(fetchCrew());
      socket.emit(SocketEventEnum.CREW_CONNECTION, crewId);
    }
  }, [crewId]);

  const authServices = useMemo(() => ({ loggedIn, logIn, logOut }), [loggedIn]);
  const modalServices = useMemo(() => ({ show, modalOpen, modalClose }), [show]);
  const scrollServices = useMemo(() => ({ scrollBar, setMarginScroll }), [scrollBar]);
  const submitServices = useMemo(() => ({ isSubmit, setIsSubmit }), [isSubmit]);
  const navbarServices = useMemo(() => ({ isActive, setIsActive, closeNavbar }), [isActive]);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthContext.Provider value={authServices}>
        <ModalContext.Provider value={modalServices}>
          <ScrollContext.Provider value={scrollServices}>
            <SubmitContext.Provider value={submitServices}>
              <NavbarContext.Provider value={navbarServices}>
                <Provider store={store}>
                  <Head>
                    <link rel="icon" type="image/png" sizes="16x16" href={favicon16.src} />
                    <link rel="icon" type="image/png" sizes="32x32" href={favicon32.src} />
                    <link rel="apple-touch-icon" sizes="57x57" href={favicon57.src} />
                    <link rel="apple-touch-icon" sizes="180x180" href={favicon180.src} />
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
    </I18nextProvider>
  );
};

export default Init;
