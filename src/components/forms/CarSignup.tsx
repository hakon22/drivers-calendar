import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
  Form, Button, Select, InputNumber, Spin,
} from 'antd';
import axios from 'axios';
import { carValidation } from '@/validations/validations';
import routes from '@/routes';
import type { Brand } from '../../../server/types/Cars';

type FuelConsumptionType = {
  city?: number;
  highway?: number;
};

export type CarSignupType = {
  brand?: string;
  model?: string;
  inventory?: number;
  call?: number;
  mileage?: number;
  mileage_after_maintenance?: number;
  remaining_fuel?: number;
  fuel_consumption_summer: FuelConsumptionType;
  fuel_consumption_winter: FuelConsumptionType;
  [key: string]: unknown;
};

type CarSignupProps = {
  values: CarSignupType,
  setValues: React.Dispatch<React.SetStateAction<CarSignupType>>;
  brands: Brand[];
};

const FuelConsumption = ({ name, t, isSubmit }: { name: string, t: (str: string) => string, isSubmit: boolean }) => (
  <div className="label-group d-flex flex-column">
    <div className="mb-3 roboto-500">{t(name)}</div>
    <ul>
      <li className="d-flex">
        <span className="col-4 mt-2 roboto-500">{t('city')}</span>
        <Form.Item<CarSignupType> name={[name, 'city']} rules={[carValidation]}>
          <InputNumber className="w-100" size="large" suffix={t('litrePerKm')} min={1} keyboard disabled={isSubmit} />
        </Form.Item>
      </li>
      <li className="d-flex">
        <span className="col-4 mt-2 roboto-500">{t('highway')}</span>
        <Form.Item<CarSignupType> name={[name, 'highway']} rules={[carValidation]}>
          <InputNumber className="w-100" size="large" suffix={t('litrePerKm')} min={1} keyboard disabled={isSubmit} />
        </Form.Item>
      </li>
    </ul>
  </div>
);

const CarSignup = ({ values, setValues, brands }: CarSignupProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'signup.carForm' });

  const [form] = Form.useForm();
  const { brand, model } = values;

  const [models, setModels] = useState<Brand[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmit, setIsSubmit] = useState(false);

  const onFinish = () => setIsSubmit(true);

  const onValuesChange = (changedValue: CarSignupType) => setValues((preValues: CarSignupType) => {
    const [key, value] = Object.entries(changedValue)[0];
    const currentObject = preValues[key];
    if (typeof value === 'object' && typeof currentObject === 'object') {
      return { ...preValues, model: changedValue.brand ? undefined : preValues.model, [key]: { ...currentObject, ...value } };
    }
    return { ...preValues, model: changedValue.brand ? undefined : preValues.model, ...changedValue };
  });

  const fetchModals = async (searchedValue: string): Promise<Brand[]> => {
    const { data } = await axios.get(`${routes.getModels}/${searchedValue}`);
    return data;
  };

  const filterOption = <T extends Brand>(input: string, option?: T) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase());

  useEffect(() => {
    if (brand) {
      if (!model) {
        form.setFieldValue('model', undefined);
      }
      setIsLoading(true);
      fetchModals(brand).then((result) => setModels(result));
      setIsLoading(false);
    }
  }, [brand]);

  return (
    <Form name="car-signup" form={form} onValuesChange={onValuesChange} onFinish={onFinish} initialValues={values} className="signup-form d-flex flex-column">
      <Spin tip={t('loading')} spinning={isSubmit} fullscreen size="large" />
      <Form.Item<CarSignupType> name="brand" rules={[carValidation]}>
        <Select size="large" placeholder={t('brand')} options={brands} showSearch filterOption={filterOption} disabled={isSubmit} />
      </Form.Item>
      <Form.Item<CarSignupType> name="model" rules={[carValidation]}>
        <Select size="large" placeholder={t('model')} options={models} showSearch filterOption={filterOption} disabled={!brand || isSubmit} loading={isLoading} />
      </Form.Item>
      <Form.Item<CarSignupType> name="inventory" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" placeholder={t('inventory')} min={1} disabled={isSubmit} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="call" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" placeholder={t('call')} min={1} disabled={isSubmit} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="mileage" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={t('km')} placeholder={t('mileage')} min={1} disabled={isSubmit} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="mileage_after_maintenance" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={t('km')} placeholder={t('mileage_after_maintenance')} min={1} disabled={isSubmit} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="remaining_fuel" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={t('litre')} placeholder={t('remaining_fuel')} min={1} disabled={isSubmit} keyboard />
      </Form.Item>
      <FuelConsumption name="fuel_consumption_summer" t={t} isSubmit={isSubmit} />
      <FuelConsumption name="fuel_consumption_winter" t={t} isSubmit={isSubmit} />
      <div className="mt-4 d-flex justify-content-center">
        <Button type="primary" className="col-10 button-height button" htmlType="submit" loading={isSubmit}>
          {isSubmit ? t('send') : t('submitButton')}
        </Button>
      </div>
    </Form>
  );
};

export default CarSignup;
