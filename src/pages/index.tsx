import { useTranslation } from 'react-i18next';
import { useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '@/components/Context';
import ModalUpdateNotice from '@/components/modals/user/ModalUpdateNotice';
import routes from '@/routes';
import FloatButtons from '@/components/FloatButtons';
import Helmet from '@/components/Helmet';
import NavBar from '@/components/NavBar';
import Calendar from '@/components/Calendar';
import { fetchUpdates } from '@/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import AdminSelectCrew from '@/components/AdminSelectCrew';
import BackButton from '@/components/BackButton';
import { removeToken } from '@/slices/crewSlice';
import RolesEnum from '../../server/types/user/enum/RolesEnum';

const Index = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loggedIn } = useContext(AuthContext);

  const { updatesNotice, role } = useAppSelector((state) => state.user);
  const { id: crewId } = useAppSelector((state) => state.crew);

  useEffect(() => {
    if (!loggedIn) {
      router.push(routes.welcomePage);
    } else {
      dispatch(fetchUpdates());
    }
  }, [loggedIn]);

  useEffect(() => {
    if (router.asPath === routes.homePage && crewId && role === RolesEnum.ADMIN) {
      dispatch(removeToken());
    }
  }, [router.asPath]);

  return loggedIn && (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <NavBar />
      {updatesNotice?.length ? <ModalUpdateNotice updatesNotice={updatesNotice} /> : null}
      <div className="my-4 col-12 d-flex flex-column align-items-center gap-3">
        <h1>{t(role === RolesEnum.ADMIN && !crewId ? 'adminTitle' : 'title')}</h1>
        {role === RolesEnum.ADMIN && crewId ? <BackButton title={t('prev')} style={{ top: '1.3rem', left: '0.7rem' }} /> : null}
        {role === RolesEnum.ADMIN && !crewId ? <AdminSelectCrew /> : <Calendar />}
      </div>
      <FloatButtons />
    </div>
  );
};

export default Index;
