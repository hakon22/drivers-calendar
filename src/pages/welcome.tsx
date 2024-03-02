import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import routes from '@/routes';
import pineapple from '../images/pineapple.svg';
import Helmet from '../components/Helmet';

const Welcome = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'welcome' });
  const router = useRouter();

  return (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <div className="my-5 col-12 d-flex flex-column align-items-center gap-5">
        <h1>{t('title')}</h1>
        <Image src={pineapple} alt={t('title')} priority />
        <div className="col-9 d-flex flex-column gap-5">
          <Button type="primary" className="button input-height" onClick={() => router.push(routes.signupPage)}>{t('signupButton')}</Button>
          <Button type="primary" className="button input-height" onClick={() => router.push(routes.loginPage)}>{t('loginButton')}</Button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
