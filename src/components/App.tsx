import { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';
import { Spin } from 'antd';
import { useAppSelector } from '@/utilities/hooks';
import useErrorHandler from '@/utilities/useErrorHandler';
import useAuthHandler from '@/utilities/useAuthHandler';
import Modals from '@/components/Modals';
import { SubmitContext } from './Context';

const storageKey = process.env.NEXT_PUBLIC_STORAGE_KEY ?? '';

const App = ({ children }: { children: JSX.Element }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'signup.carForm' });
  const [isLoaded, setIsLoaded] = useState(false);

  const { error, token, loadingStatus } = useAppSelector((state) => state.user);
  const { isSubmit } = useContext(SubmitContext);

  useErrorHandler(error);
  useAuthHandler();

  useEffect(() => {
    const tokenStorage = window.localStorage.getItem(storageKey);
    if (!tokenStorage) {
      setIsLoaded(true);
    } else if (token) {
      setIsLoaded(true);
    }
  }, [token, loadingStatus]);

  return (
    <>
      <Modals />
      {isLoaded ? (
        <>
          <Spin tip={t('loading')} spinning={isSubmit} fullscreen size="large" />
          <div className="container position-relative">
            {children}
          </div>
        </>
      ) : (
        <div className="spinner">
          <Spinner animation="border" variant="primary" role="status" />
        </div>
      )}
    </>
  );
};

export default App;
