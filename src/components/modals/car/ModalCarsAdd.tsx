import { Form, Modal } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ApiContext, ModalContext, SubmitContext } from '@/components/Context';
import CarSignup, { CarSignupType } from '@/components/forms/CarSignup';
import axios from 'axios';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import routes from '@/routes';
import toast from '@/utilities/toast';
import { Brand } from '../../../../server/types/Cars';

const ModalCarsAdd = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.carsAdd' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { modalOpen } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { carAdd } = useContext(ApiContext);

  const { crewId, token } = useAppSelector((state) => state.user);

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

  const [brands, setBrands] = useState<Brand[]>();
  const [carsValues, setCarsValues] = useState<CarSignupType>(initialCarValues);

  const fetchBrands = async () => {
    try {
      const { data } = await axios.get(routes.fetchBrandsChange);
      setBrands(data);
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  useEffect(() => {
    if (!brands) {
      fetchBrands();
    }
  }, []);

  return (
    <Modal
      centered
      open
      footer={null}
      styles={{
        content: {
          paddingLeft: '0.5em', paddingRight: '0.5em', maxHeight: '90vh', overflow: 'auto',
        },
      }}
      onCancel={() => modalOpen('carsControl', undefined, 'none')}
    >
      <Form.Provider
        onFormFinish={async (name, { forms: currentForms }) => {
          if (name === 'car-signup') {
            try {
              setIsSubmit(true);
              const { data } = await axios.post(routes.createCar, carsValues, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (data.code === 1) {
                carAdd({ ...data, crewId });
                modalOpen('carsControl');
              } else if (data.code === 2) {
                toast(tToast('carAlreadyExists'), 'error');
                currentForms[name].setFields([
                  { name: 'inventory', errors: [tToast('carAlreadyExists')] },
                  { name: 'call', errors: [tToast('carAlreadyExists')] },
                ]);
              }
              setIsSubmit(false);
            } catch (e) {
              setTimeout(setIsSubmit, 1500, false);
              axiosErrorHandler(e, tToast);
            }
          }
        }}
      >
        <div className="col-12 my-4 d-flex flex-column align-items-center gap-3">
          <div className="h1">{t('title')}</div>
          <CarSignup values={carsValues} setValues={setCarsValues} brands={brands as Brand[]} />
        </div>
      </Form.Provider>
    </Modal>
  );
};

export default ModalCarsAdd;
