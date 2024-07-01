import axios from 'axios';
import type { TFunction } from 'i18next';
import toast from './toast';

const axiosErrorHandler = (e: unknown, t: TFunction) => {
  if (axios.isAxiosError(e)) {
    toast(e.code === 'ERR_NETWORK' ? t('networkError') : t('unknownError', { error: e.message }), 'error');
  }
  console.log(e);
};

export default axiosErrorHandler;
