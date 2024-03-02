import { useTranslation } from 'react-i18next';
import Helmet from '../components/Helmet';

const Page404 = () => {
  const { t } = useTranslation('translation', { keyPrefix: '404' });

  return (
    <div className="my-4 row d-flex justify-content-center">
      <div className="col-12 col-md-8">
        <Helmet title={t('title')} description={t('description')} />
        404
      </div>
    </div>
  );
};

export default Page404;
