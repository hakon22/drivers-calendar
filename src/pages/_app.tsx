/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { useCallback, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import {
  ApiContext, AuthContext, ModalContext, ScrollContext, SubmitContext,
} from '@/components//Context';
import type { ModalShowType, ModalShowObjectType } from '@/types/Modal';
import routes from '@/routes';
import { removeToken } from '@/slices/userSlice';
import favicon from '../images/favicon.ico';
import store from '../slices/index';
import App from '../components/App';
import i18n from '../locales';
import '../scss/app.scss';

const storageKey = process.env.NEXT_PUBLIC_STORAGE_KEY ?? '';

const Init = (props: AppProps) => {
  const { pageProps, Component } = props;
  const { dispatch } = store;
  const router = useRouter();

  const { id, refreshToken } = store.getState().user;

  const [isSubmit, setIsSubmit] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
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
    dispatch(removeToken());
    setLoggedIn(false);
  }, [id]);

  const [show, setShow] = useState<ModalShowType | ModalShowObjectType>('none');
  const modalOpen = (arg: ModalShowType, modalSetState?: React.Dispatch<React.SetStateAction<any>>) => (modalSetState ? setShow({ show: arg, modalSetState }) : setShow(arg));
  const modalClose = () => setShow('none');

  const scrollPx = () => window.innerWidth - document.body.clientWidth;

  const [scrollBar, setScrollBar] = useState(0);
  const setMarginScroll = () => {
    const px = scrollPx();
    if (px) {
      setScrollBar(px - 1);
    } else {
      setScrollBar(px);
    }
  };

  const socket = io(process.env.NODE_ENV === 'development' ? '' : process.env.NEXT_PUBLIC_SOCKET_HOST ?? '');

  const socketConnect = useCallback((param: string, arg: unknown) => {
    socket.emit(param, arg);
  }, [socket]);

  const socketApi = useMemo(() => ({
    test: (data: unknown) => socketConnect('test', data),
  }), [socketConnect]);

  // socket.on('test', (data) => dispatch(test(data)));

  const authServices = useMemo(() => ({ loggedIn, logIn, logOut }), [loggedIn]);
  const modalServices = useMemo(() => ({ show, modalOpen, modalClose }), [show]);
  const scrollServices = useMemo(() => ({ scrollBar, setMarginScroll }), [scrollBar]);
  const submitServices = useMemo(() => ({ isSubmit, setIsSubmit }), [isSubmit]);

  return (
    <I18nextProvider i18n={i18n}>
      <ApiContext.Provider value={socketApi}>
        <AuthContext.Provider value={authServices}>
          <ModalContext.Provider value={modalServices}>
            <ScrollContext.Provider value={scrollServices}>
              <SubmitContext.Provider value={submitServices}>
                <Provider store={store}>
                  <Head>
                    <link rel="shortcut icon" href={favicon.src} />
                  </Head>
                  <ToastContainer />
                  <App>
                    <Component {...pageProps} />
                  </App>
                </Provider>
              </SubmitContext.Provider>
            </ScrollContext.Provider>
          </ModalContext.Provider>
        </AuthContext.Provider>
      </ApiContext.Provider>
    </I18nextProvider>
  );
};

export default Init;
