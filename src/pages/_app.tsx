/* eslint-disable react/jsx-props-no-spreading */
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import favicon from '../images/favicon.ico';
import store from '../slices/index';
import App from '../components/App';
import i18n from '../locales';
import '../scss/app.scss';

interface InitProps extends AppProps {
  isMob: boolean;
}

const init = (props: InitProps) => {
  const { pageProps, Component } = props;

  return (
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <Head>
          <link rel="shortcut icon" href={favicon.src} />
        </Head>
        <ToastContainer />
        <App>
          <Component {...pageProps} />
        </App>
      </Provider>
    </I18nextProvider>
  );
};

export default init;
