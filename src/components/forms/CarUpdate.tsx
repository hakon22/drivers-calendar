import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import {
  Form, Button, Select, Input, InputNumber,
} from 'antd';
import axios from 'axios';
import { carValidation } from '@/validations/validations';
import routes from '@/routes';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import { useAppSelector } from '@/utilities/hooks';
import toast from '@/utilities/toast';
import type { Brand } from '../../../server/types/Cars';
import type { CarSignupType } from './CarSignup';
import { ApiContext, ModalContext, SubmitContext } from '../Context';

type CarUpdateProps = {
  car: CarSignupType,
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

const CarUpdate = ({ car }: CarUpdateProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsEdit' });
  const { t: tCarForm } = useTranslation('translation', { keyPrefix: 'signup.carForm' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const [form] = Form.useForm();
  const { token, crewId } = useAppSelector((state) => state.user);

  const [values, setValues] = useState(car);

  const [models, setModels] = useState<Brand[]>();
  const [brands, setBrands] = useState<Brand[]>();

  const { setIsSubmit } = useContext(SubmitContext);
  const { carUpdate } = useContext(ApiContext);
  const { modalOpen } = useContext(ModalContext);

  const { brand, model } = values;

  const onValuesChange = (changedValue: CarSignupType) => setValues((preValues: CarSignupType) => {
    const [key, value] = Object.entries(changedValue)[0];
    const currentObject = preValues[key];
    if (typeof value === 'object' && typeof currentObject === 'object') {
      return { ...preValues, model: changedValue.brand ? undefined : preValues.model, [key]: { ...currentObject, ...value } };
    }
    return { ...preValues, model: changedValue.brand ? undefined : preValues.model, ...changedValue };
  });

  const onFinish = async (finishValues: CarSignupType) => {
    try {
      setIsSubmit(true);
      const { data: { code, car: updatedCar } } = await axios.patch(`${routes.updateCar}/${car.id}`, finishValues, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (code === 3) {
        toast(tToast('carAlreadyExists'), 'error');
        form.setFields([
          { name: 'inventory', errors: [tToast('carAlreadyExists')] },
          { name: 'call', errors: [tToast('carAlreadyExists')] },
        ]);
      } else if (code === 2) {
        toast(tToast('carNotOnTheCrew'), 'error');
      } else if (code === 1) {
        carUpdate({ car: updatedCar, code, crewId });
        modalOpen('carsControl');
        toast(tToast('carUpdateSuccess'), 'success');
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  const fetchModels = async (searchedValue: string) => {
    try {
      const { data } = await axios.get(`${routes.getModels}/${searchedValue}`);
      setModels(data);
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(routes.fetchBrandsChange);
      setBrands(data);
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  const filterOption = <T extends Brand>(input: string, option?: T) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase());

  useEffect(() => {
    if (!brands) {
      fetchBrands();
    }
  }, []);

  useEffect(() => {
    if (brand) {
      setIsSubmit(true);
      if (!model) {
        form.setFieldValue('model', undefined);
      }
      fetchModels(brand);
      setIsSubmit(false);
    }
  }, [brand]);

  return (
    <Form name="car-update" form={form} onFinish={onFinish} onValuesChange={onValuesChange} initialValues={values} className="signup-form d-flex flex-column">
      <Form.Item<CarSignupType> name="brand" rules={[carValidation]}>
        <Select size="large" placeholder={tCarForm('brand')} options={brands} showSearch filterOption={filterOption} />
      </Form.Item>
      <Form.Item<CarSignupType> name="model" rules={[carValidation]}>
        <Select size="large" placeholder={tCarForm('model')} options={models} showSearch filterOption={filterOption} disabled={!brand} />
      </Form.Item>
      <Form.Item<CarSignupType> name="call" rules={[carValidation]}>
        <Input size="large" className="w-100" placeholder={tCarForm('call')} min={1} />
      </Form.Item>
      <Form.Item<CarSignupType> name="inventory" rules={[carValidation]}>
        <Input size="large" className="w-100" placeholder={tCarForm('inventory')} min={1} />
      </Form.Item>
      <Form.Item<CarSignupType> name="mileage" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={tCarForm('km')} placeholder={t('mileage')} min={1} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="mileage_after_maintenance" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={tCarForm('km')} placeholder={t('mileage_after_maintenance')} min={1} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="remaining_fuel" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={tCarForm('litre')} placeholder={t('remaining_fuel')} min={1} keyboard />
      </Form.Item>
      <FuelConsumption name="fuel_consumption_summer" t={tCarForm} />
      <FuelConsumption name="fuel_consumption_winter" t={tCarForm} />
      <div className="mt-4 d-flex justify-content-center">
        <Button type="primary" className="col-10 button-height button" htmlType="submit">
          {t('update')}
        </Button>
      </div>
    </Form>
  );
};

export default CarUpdate;
