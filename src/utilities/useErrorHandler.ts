import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Error } from '@/types/InitialState';
import toast from './toast';

const useErrorHandler = (error: Error) => {
  const { t } = useTranslation('translation', { keyPrefix: 'toast' });

  useEffect(() => {
    const errorHandler = (err: string) => {
      const [match] = err.match(/\d+/) ?? '500';
      const codeError = parseInt(match, 10);
      if (codeError === 401) {
        toast(t('authError'), 'error');
      } else if (codeError === 500) {
        toast(t('unknownError'), 'error');
      } else {
        toast(t('networkError'), 'error');
      }
      console.log(err);
    };

    if (error) {
      errorHandler(error);
    }
  }, [error]);
};

export default useErrorHandler;
