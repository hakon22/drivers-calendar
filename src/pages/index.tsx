import { useTranslation } from 'react-i18next';
import { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/Context';
import ModalUpdateNotice from '@/components/modals/user/ModalUpdateNotice';
import routes from '@/routes';
import FloatButtons from '@/components/FloatButtons';
import Helmet from '@/components/Helmet';
import NavBar from '@/components/NavBar';
import Calendar from '@/components/Calendar';
import { fetchUpdates } from '@/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';

const Index = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loggedIn } = useContext(AuthContext);

  const { updatesNotice } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!loggedIn) {
      router.push(routes.welcomePage);
    } else {
      dispatch(fetchUpdates());
    }
  }, [loggedIn]);

  return loggedIn && (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <NavBar />
      {updatesNotice?.length ? <ModalUpdateNotice updatesNotice={updatesNotice} /> : null}
      <div className="my-4 col-12 d-flex flex-column align-items-center gap-3">
        <h1>{t('title')}</h1>
        <Calendar />
      </div>
      <FloatButtons />
    </div>
  );
};

export default Index;
