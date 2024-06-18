import { useTranslation } from 'react-i18next';
import { useEffect, useContext } from 'react';
import type { GetServerSideProps } from 'next';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { AuthContext } from '@/components/Context';
import routes from '@/routes';
import FloatButtons from '@/components/FloatButtons';
import Helmet from '@/components/Helmet';
import NavBar from '@/components/NavBar';
import Calendar from '@/components/Calendar';

const Index = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loggedIn } = useContext(AuthContext);
  const { token, crewId } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!loggedIn) {
      router.push(routes.welcomePage);
    }
  }, [loggedIn]);

  return loggedIn && (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <NavBar />
      <div className="my-4 col-12 d-flex flex-column align-items-center gap-3">
        <h1>{t('title')}</h1>
        <Calendar />
      </div>
      <FloatButtons />
    </div>
  );
};

export default Index;
