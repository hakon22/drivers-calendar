import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { GetServerSideProps } from 'next';
import { Button, Form, Steps } from 'antd';
import axios from 'axios';
import Helmet from '@/components/Helmet';
import UserSignup, { type UserSignupType } from '@/components/forms/UserSignup';
import CarSignup, { type CarSignupType } from '@/components/forms/CarSignup';
import routes from '@/routes';
import type { Brand } from '../../server/types/Cars';

const Signup = ({ brands }: { brands: Brand[] }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'signup' });

  const initialUserValues = {
    phone: '',
    username: '',
    schedule: '',
    color: '',
  };

  const initialCarValues = {
    brand: '',
    model: '',
    inventory: undefined,
    call: undefined,
    mileage: undefined,
    mileage_before_maintenance: undefined,
    remaining_fuel: undefined,
    fuel_consumption_winter: undefined,
    fuel_consumption_summer: undefined,
  };

  const [currentForm, setCurrentForm] = useState(0);
  const [userValues, setUserValues] = useState<UserSignupType>(initialUserValues);
  const [carsValues, setCarsValues] = useState<CarSignupType>(initialCarValues);

  const next = () => setCurrentForm(currentForm + 1);
  const prev = () => setCurrentForm(currentForm - 1);

  const steps = [
    {
      key: '1',
      title: '',
      content: <UserSignup values={userValues} setValues={setUserValues} next={next} />,
    },
    {
      key: '2',
      title: '',
      content: <CarSignup values={carsValues} setValues={setCarsValues} brands={brands} prev={prev} />,
    },
  ];

  return (
    <Form.Provider
      onFormFinish={(name, info) => {
        if (name === 'signup') {
          console.log(info);
        }
      }}
      onFormChange={(name, { forms: { signup } }) => {
        if (name === 'signup') {
          console.log(signup.isFieldsValidating());
        }
      }}
    >
      <div className="d-flex justify-content-center anim-show">
        <Helmet title={t('title')} description={t('description')} />
        <div className="my-5 col-12 d-flex flex-column align-items-center gap-5">
          <h1>{t('title')}</h1>
          <div className="col-9 d-flex flex-column gap-5">
            <Steps current={currentForm} size="small" direction="vertical" items={steps} className="position-absolute w-50" style={{ left: 5 }} />
            <div className="mb-2">{steps[currentForm].content}</div>
          </div>
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
