import { useTranslation } from 'react-i18next';
import { Button } from 'antd';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import routes from '@/routes';
import pineapple from '../images/pineapple.svg';
import Helmet from '../components/Helmet';

export const LoginButton = ({ title, className, onClick }: { title: string, className: string, onClick?: () => void }) => {
  const router = useRouter();

  return (
    <Button
      type="primary"
      className={className}
      onClick={() => {
        if (onClick) {
          onClick();
        }
        router.push(routes.loginPage);
      }}
    >
      {title}
    </Button>
  );
};

LoginButton.defaultProps = {
  onClick: undefined,
};

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
          <Button type="primary" className="button button-height" onClick={() => router.push(routes.signupPage)}>{t('signupButton')}</Button>
          <LoginButton title={t('loginButton')} className="button button-height" />
        </div>
      </div>
    </div>
  );
};

export default Welcome;
