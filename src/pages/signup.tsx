import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import type { GetServerSideProps } from 'next';
import { Form } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/router';
import Helmet from '@/components/Helmet';
import UserSignup, { type UserSignupType } from '@/components/forms/UserSignup';
import CarSignup, { type CarSignupType } from '@/components/forms/CarSignup';
import routes from '@/routes';
import BackButton from '@/components/BackButton';
import type { Brand } from '../../server/types/Cars';

const Signup = ({ brands }: { brands: Brand[] }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'signup' });
  const { asPath } = useRouter();

  const initialUserValues = {
    phone: '',
    username: '',
    schedule: '',
    color: '',
  };

  const initialCarValues = {
    brand: undefined,
    model: undefined,
    inventory: undefined,
    call: undefined,
    mileage: undefined,
    mileage_after_maintenance: undefined,
    remaining_fuel: undefined,
    fuel_consumption_winter: { city: undefined, highway: undefined },
    fuel_consumption_summer: { city: undefined, highway: undefined },
  };

  const [currentForm, setCurrentForm] = useState(0);
  const [userValues, setUserValues] = useState<UserSignupType>(initialUserValues);
  const [carsValues, setCarsValues] = useState<CarSignupType>(initialCarValues);

  const next = () => setCurrentForm(currentForm + 1);
  const prev = () => setCurrentForm(currentForm - 1);

  const forms = [
    {
      key: 1,
      content: <UserSignup values={userValues} setValues={setUserValues} next={next} />,
    },
    {
      key: 2,
      content: <CarSignup values={carsValues} setValues={setCarsValues} brands={brands} />,
    },
  ];

  useEffect(() => {
    // если на форме Car нажал "назад" в браузере - переносим на форму User
    if (asPath === routes.signupPage && currentForm === 1) {
      prev();
    }
  }, [asPath]);

  return (
    <Form.Provider
      onFormFinish={(name) => {
        if (name === 'car-signup') {
          console.log({ user: userValues, car: carsValues });
        }
      }}
    >
      <div className="d-flex justify-content-center anim-show">
        <Helmet title={t('title')} description={t('description')} />
        <BackButton title={t('prev')} />
        <div className="my-5 col-12 d-flex flex-column align-items-center gap-5">
          <h1>{t('title')}</h1>
          <div className="col-10">{forms[currentForm].content}</div>
        </div>
      </div>
    </Form.Provider>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const { data: brands } = await axios.get(routes.fetchBrands);

  return { props: { brands } };
};

export default Signup;
