import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import type { Error } from '@/types/InitialState';
import routes from '@/routes';
import { SubmitContext } from '@/components/Context';
import toast from './toast';

const useErrorHandler = (...errors: Error[]) => {
  const { t } = useTranslation('translation', { keyPrefix: 'toast' });
  const router = useRouter();

  const { setIsSubmit } = useContext(SubmitContext);

  useEffect(() => {
    const errorHandler = (err: string) => {
      const [match] = err.match(/\d+/) ?? '500';
      const codeError = parseInt(match, 10);
      if (codeError === 401) {
        toast(t('authError'), 'error');
        setTimeout(() => {
          if (router.asPath === routes.homePage) {
            router.push(routes.loginPage);
          }
        }, 1000);
      } else if (codeError === 500) {
        toast(t('unknownError'), 'error');
      } else {
        toast(t('networkError'), 'error');
      }
      setIsSubmit(false);
      console.log(err);
    };

    if (errors.find(Boolean)) {
      errors.forEach((error) => (error ? errorHandler(error) : undefined));
    }
  }, [...errors]);
};

export default useErrorHandler;
