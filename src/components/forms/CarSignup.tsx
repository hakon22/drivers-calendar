import { useTranslation } from 'react-i18next';
import { useEffect, useState, useContext } from 'react';
import {
  Form, Button, Select, Input, InputNumber,
} from 'antd';
import axios from 'axios';
import { carValidation } from '@/validations/validations';
import routes from '@/routes';
import type { Brand } from '../../../server/types/Cars';
import { SubmitContext } from '../Context';

type FuelConsumptionType = {
  city?: number;
  highway?: number;
};

export type CarSignupType = {
  brand?: string;
  model?: string;
  inventory?: string;
  call?: string;
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

const CarSignup = ({ values, setValues, brands }: CarSignupProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'signup.carForm' });

  const [form] = Form.useForm();
  const { brand, model } = values;

  const [models, setModels] = useState<Brand[]>();

  const { setIsSubmit } = useContext(SubmitContext);

  const onValuesChange = (changedValue: CarSignupType) => setValues((preValues: CarSignupType) => {
    const [key, value] = Object.entries(changedValue)[0];
    const currentObject = preValues[key];
    if (typeof value === 'object' && typeof currentObject === 'object') {
      return { ...preValues, model: changedValue.brand ? undefined : preValues.model, [key]: { ...currentObject, ...value } };
    }
    return { ...preValues, model: changedValue.brand ? undefined : preValues.model, ...changedValue };
  });

  const fetchModels = async (searchedValue: string): Promise<Brand[]> => {
    const { data } = await axios.get(`${routes.getModels}/${searchedValue}`);
    return data;
  };

  const filterOption = <T extends Brand>(input: string, option?: T) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase());

  useEffect(() => {
    if (brand) {
      setIsSubmit(true);
      if (!model) {
        form.setFieldValue('model', undefined);
      }
      fetchModels(brand).then((result) => setModels(result));
      setIsSubmit(false);
    }
  }, [brand]);

  return (
    <Form name="car-signup" form={form} onValuesChange={onValuesChange} initialValues={values} className="signup-form d-flex flex-column">
      <Form.Item<CarSignupType> name="brand" rules={[carValidation]}>
        <Select size="large" placeholder={t('brand')} options={brands} showSearch filterOption={filterOption} />
      </Form.Item>
      <Form.Item<CarSignupType> name="model" rules={[carValidation]}>
        <Select size="large" placeholder={t('model')} options={models} showSearch filterOption={filterOption} disabled={!brand} />
      </Form.Item>
      <Form.Item<CarSignupType> name="call" rules={[carValidation]}>
        <Input size="large" className="w-100" placeholder={t('call')} min={1} />
      </Form.Item>
      <Form.Item<CarSignupType> name="inventory" rules={[carValidation]}>
        <Input size="large" className="w-100" placeholder={t('inventory')} min={1} />
      </Form.Item>
      <Form.Item<CarSignupType> name="mileage" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={t('km')} placeholder={t('mileage')} min={1} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="mileage_after_maintenance" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={t('km')} placeholder={t('mileage_after_maintenance')} min={1} keyboard />
      </Form.Item>
      <Form.Item<CarSignupType> name="remaining_fuel" rules={[carValidation]}>
        <InputNumber size="large" className="w-100" suffix={t('litre')} placeholder={t('remaining_fuel')} min={1} keyboard />
      </Form.Item>
      <FuelConsumption name="fuel_consumption_summer" t={t} />
      <FuelConsumption name="fuel_consumption_winter" t={t} />
      <div className="mt-4 d-flex justify-content-center">
        <Button type="primary" className="col-10 button-height button" htmlType="submit">
          {t('submitButton')}
        </Button>
      </div>
    </Form>
  );
};

export default CarSignup;
