import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import {
  Form, Button, Select, Input, InputNumber,
} from 'antd';
import axios from 'axios';
import { isEqual } from 'lodash';
import { carValidation } from '@/validations/validations';
import routes from '@/routes';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import { useAppSelector } from '@/utilities/hooks';
import toast from '@/utilities/toast';
import type { Brand } from '../../../server/types/Cars';
import type { CarSignupType } from './CarSignup';
import { ApiContext, ModalContext, SubmitContext } from '../Context';
import { CarModel } from '../../../server/db/tables/Cars';

type CarAddType = {
  brand: '',
};

const FuelConsumption = ({ name, t }: { name: string, t: (str: string) => string }) => (
  <div className="label-group d-flex flex-column">
    <div className="mb-3 roboto-500">{t(name)}</div>
    <ul>
      <li className="d-flex">
        <span className="col-4 mt-2 roboto-500">{t('city')}</span>
        <Form.Item<CarSignupType> name={[name, 'city']} rules={[carValidation]}>
          <InputNumber className="w-100" size="large" suffix={t('litrePerKm')} min={1} keyboard />
        </Form.Item>
      </li>
      <li className="d-flex">
        <span className="col-4 mt-2 roboto-500">{t('highway')}</span>
        <Form.Item<CarSignupType> name={[name, 'highway']} rules={[carValidation]}>
          <InputNumber className="w-100" size="large" suffix={t('litrePerKm')} min={1} keyboard />
        </Form.Item>
      </li>
    </ul>
  </div>
);

const CarAdd = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsEdit' });
  const { t: tCarForm } = useTranslation('translation', { keyPrefix: 'signup.carForm' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const [form] = Form.useForm();
  const { token, crewId } = useAppSelector((state) => state.user);

  const [cars, setCars] = useState<Brand[]>();
  const [loading, setLoading] = useState(false);

  const { setIsSubmit } = useContext(SubmitContext);
  const { carAdd } = useContext(ApiContext);
  const { modalOpen } = useContext(ModalContext);

  const fetchCarList = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(routes.fetchCarList, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.code === 1) {
        setCars(data.cars);
      }
      setLoading(false);
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  const onFinish = async ({ brand }: { brand: string }) => {
    setIsSubmit(true);
    const car = cars?.find((item) => item.label === brand);
    console.log(car);
    setIsSubmit(false);
  };

  const filterOption = <T extends Brand>(input: string, option?: T) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase());

  useEffect(() => {
    fetchCarList();
  }, []);

  return (
    <Form name="car-add" form={form} onFinish={onFinish} className="signup-form d-flex flex-column col-9">
      <Form.Item<CarAddType> name="brand" rules={[carValidation]}>
        <Select size="large" placeholder={tCarForm('brand')} options={cars} showSearch filterOption={filterOption} loading={loading} />
      </Form.Item>
      <div className="mt-4 d-flex justify-content-center">
        <Button type="primary" className="col-10 button-height button" htmlType="submit">
          {t('add')}
        </Button>
      </div>
    </Form>
  );
};

export default CarAdd;
