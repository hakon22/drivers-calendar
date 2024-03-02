import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { UserOutlined, PhoneOutlined } from '@ant-design/icons';
import {
  Form, Input, Radio, Button, Select, InputNumber,
} from 'antd';
import axios from 'axios';
import { carValidation } from '@/validations/validations';
import routes from '@/routes';
import type { Brand } from '../../../server/types/Cars';

export type CarSignupType = {
  brand: string;
  model: string;
  inventory?: number;
  call?: number;
  mileage?: number;
  mileage_before_maintenance?: number;
  remaining_fuel?: number;
  fuel_consumption_summer?: number;
  fuel_consumption_winter?: number;
};

type CarSignupProps = {
  values: CarSignupType,
  setValues: React.Dispatch<React.SetStateAction<CarSignupType>>;
  brands: Brand[];
  prev: () => void;
};

const CarSignup = ({
  values, setValues, brands, prev,
}: CarSignupProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'signup.carForm' });

  const [form] = Form.useForm();
  const brand: string = Form.useWatch('brand', form);

  const [models, setModels] = useState<Brand[]>();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = (carValues: CarSignupType) => {
    console.log(carValues);
  };

  const fetchModals = async (searchedValue: string): Promise<Brand[]> => {
    const { data } = await axios.get(`${routes.getModels}/${searchedValue}`);
    return data;
  };

  const filterOption = <T extends Brand>(input: string, option?: T) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase());

  useEffect(() => {
    if (brand) {
      form.setFieldValue('model', '');
      setIsLoading(true);
      fetchModals(brand).then((result) => setModels(result));
      setIsLoading(false);
    }
  }, [brand]);

  return (
    <Form name="car-signup" form={form} initialValues={values} className="signup-form d-flex flex-column" onFinish={onFinish} autoComplete="off">
      <Form.Item<CarSignupType> name="brand" label={t('brand')} rules={[carValidation]} required>
        <Select className="input-height" options={brands} showSearch filterOption={filterOption} />
      </Form.Item>
      <Form.Item<CarSignupType> name="model" label={t('model')} rules={[carValidation]} required>
        <Select className="input-height" options={models} showSearch filterOption={filterOption} disabled={!brand} loading={isLoading} />
      </Form.Item>
      <Form.Item<CarSignupType> name="inventory" label={t('inventory')} rules={[carValidation]} required>
        <InputNumber className="input-height" min={1} keyboard />
      </Form.Item>
      <div className="mt-4 d-flex justify-content-around">
        <Button onClick={prev} className="input-height border-button">
          {t('prev')}
        </Button>
        <Button type="primary" className="input-height button" htmlType="submit">
          {t('submitButton')}
        </Button>
      </div>
    </Form>
  );
};

export default CarSignup;
