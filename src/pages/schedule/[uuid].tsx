import axios from 'axios';
import { useTranslation } from 'react-i18next';
import routes from '@/routes';
import Calendar from '@/components/Calendar';
import { useEffect } from 'react';
import { useAppDispatch } from '@/utilities/hooks';
import { addCrew } from '@/slices/crewSlice';
import Helmet from '@/components/Helmet';
import { uuidValidation } from '@/validations/validations';
import { CrewModel } from '../../../server/db/tables/Crews';

export const getServerSideProps = async ({ params }: { params: { uuid: string } }) => {
  try {
    const { uuid } = params;
    await uuidValidation.serverValidator({ uuid });

    const { data } = await axios.get<{ code: number, crew: CrewModel }>(`${routes.fetchCrewByRef}/${uuid}`);

    return data.code === 1
      ? { props: { crew: data.crew } }
      : {
        redirect: {
          permanent: false,
          destination: '/',
        },
      };
  } catch {
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };
  }
};

const Schedule = ({ crew }: { crew: CrewModel }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'index' });
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(addCrew(crew));
  }, []);

  return (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <div className="my-4 col-12 d-flex flex-column align-items-center gap-3">
        <h1>{t('title')}</h1>
        <Calendar />
      </div>
    </div>
  );
};

export default Schedule;
