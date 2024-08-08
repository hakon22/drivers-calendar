import { useTranslation } from 'react-i18next';
import {
  JSXElementConstructor, ReactElement, useContext, useEffect, useState,
} from 'react';
import { Form, Button, Select } from 'antd';
import axios from 'axios';
import { carValidation } from '@/validations/validations';
import routes from '@/routes';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import { useAppSelector } from '@/utilities/hooks';
import type { Brand } from '../../../server/types/Cars';
import { SubmitContext, ModalContext } from '../Context';

type CarAddType = {
  brand: '',
};

const CarAdd = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsEdit' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const [form] = Form.useForm();
  const { id: crewId, cars: currentCars } = useAppSelector((state) => state.crew);

  const [cars, setCars] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);

  const { setIsSubmit } = useContext(SubmitContext);
  const { modalOpen } = useContext(ModalContext);

  const fetchCarList = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(routes.fetchCarList, { params: { crewId } });
      if (data.code === 1) {
        setCars(data.cars);
      }
      setLoading(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const onFinish = async ({ brand }: { brand: string }) => {
    try {
      setIsSubmit(true);
      const car = cars?.find((item) => item.label === brand);
      if (car) {
        const { data } = await axios.post(routes.addCar, car, { params: { crewId } }) as { data: { code: number } };
        if (data.code === 1) {
          setCars(cars.filter(({ value }) => value !== car.value));
          form.setFieldValue('brand', undefined);
        }
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const dropdownRender = (menu: ReactElement<unknown, string | JSXElementConstructor<unknown>>) => (
    <>
      <div className="mb-4">{menu}</div>
      <Button type="text" className="my-2 mx-auto d-block button" onClick={() => modalOpen('carsAdd')}>
        {t('addNewCar')}
      </Button>
    </>
  );

  const filterOption = <T extends Brand>(input: string, option?: T) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase());

  useEffect(() => {
    fetchCarList();
  }, [currentCars.length]);

  return (
    <Form name="car-add" form={form} onFinish={onFinish} className="d-flex flex-column col-9">
      <Form.Item<CarAddType> name="brand" rules={[carValidation]}>
        <Select
          size="large"
          placeholder={t('selectCar')}
          options={cars}
          notFoundContent={<div className="text-center">{t('carsNotFound')}</div>}
          showSearch
          filterOption={filterOption}
          loading={loading}
          dropdownRender={dropdownRender}
        />
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
