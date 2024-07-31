import {
  Modal, Result, Button, Form, Checkbox, InputNumber,
} from 'antd';
import type EndWorkShiftFormType from '@/types/EndWorkShiftForm';
import { useContext, useState } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, SubmitContext } from '@/components/Context';
import { endWorkShiftValidation } from '@/validations/validations';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import axios from 'axios';
import routes from '@/routes';
import toast from '@/utilities/toast';

export type Result = {
  code: number;
  mileage: number;
  mileageAfterMaintenance: number;
  remainingFuel: number;
  fuelConsumptionCity: number;
  fuelConsumptionHighway?: number;
  totalFuelConsumption?: number;
  downtime?: number;
  resultRefueling?: number;
}

const ModalEndWorkShift = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.endWorkShift' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { setIsSubmit } = useContext(SubmitContext);
  const { modalClose } = useContext(ModalContext);

  const { activeCar, cars } = useAppSelector((state) => state.crew);

  const [isRefueling, setIsRefueling] = useState(false);
  const [isHighway, setIsHighway] = useState(false);
  const [isDowntime, setIsDowntime] = useState(false);

  const [result, setResult] = useState<Omit<Result, 'code'>>();

  const car = cars.find(({ id }) => id === activeCar);
  const callInventory = `${car?.brand} ${car?.model} (${car?.call}/${car?.inventory})`;

  const onFinish = async (values: EndWorkShiftFormType) => {
    try {
      setIsSubmit(true);
      const { data } = await axios.post(routes.endWorkShift, values) as { data: Result };
      const { code, ...rest } = data;
      if (code === 1) {
        setResult(rest);
        toast(tToast('endShiftSuccess'), 'success');
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <Result
        status={result ? 'success' : 'warning'}
        title={t('title')}
        subTitle={callInventory}
        className="p-0 mt-result-extra-0"
        extra={result ? (
          <div className="my-4">
            <div className="my-5 d-flex flex-column text-start">
              {Object.entries(result).map(([key, value]) => (
                <div key={key}>
                  <div>
                    <span>{t(key)}</span>
                    <span className="fw-bold">
                      <span className="fs-6" style={{ marginRight: '2px' }}>{value}</span>
                      <span className="">{key === 'mileage' || key === 'mileageAfterMaintenance' ? 'км' : 'л'}</span>
                    </span>
                  </div>
                  {key === 'remainingFuel' && <hr className="mt-2 mb-1" />}
                </div>
              ))}
            </div>
            <Button className="col-10 button-height button" onClick={modalClose}>
              {t('complete')}
            </Button>
          </div>
        ) : (
          <Form name="end-work-shift" className="text-start mt-n5" onFinish={onFinish}>
            <div className="text-muted d-flex justify-content-between mt-2 mb-3">
              <span>{t('startMileage', { mileage: car?.mileage })}</span>
              <span>{t('startRemainingFuel', { fuel: car?.remaining_fuel })}</span>
            </div>
            <div className="user-legend mb-2" style={{ rowGap: '0.5em' }}>
              <Checkbox checked={isRefueling} onChange={({ target }) => setIsRefueling(target.checked)}>{t('isRefueling')}</Checkbox>
              <Checkbox checked={isHighway} onChange={({ target }) => setIsHighway(target.checked)}>{t('isHighway')}</Checkbox>
              <Checkbox checked={isDowntime} onChange={({ target }) => setIsDowntime(target.checked)}>{t('isDowntime')}</Checkbox>
            </div>
            <Form.Item<EndWorkShiftFormType> label={t('mileageCity')} rules={[endWorkShiftValidation]} className="mb-1" name="mileageCity" required>
              <InputNumber size="large" className="w-100" suffix={t('km')} placeholder={t('mileageCity')} min={0} keyboard />
            </Form.Item>
            {isRefueling && (
            <Form.Item<EndWorkShiftFormType> label={t('refueling')} rules={[endWorkShiftValidation]} className="mb-1" name="refueling" required>
              <InputNumber size="large" className="w-100" suffix={t('litre')} placeholder={t('refueling')} min={1} keyboard />
            </Form.Item>
            )}
            {isDowntime && (
            <Form.Item<EndWorkShiftFormType> label={t('isDowntime')} rules={[endWorkShiftValidation]} className="mb-1" name="downtime" required>
              <InputNumber size="large" className="w-100" suffix={t('litre')} placeholder={t('isDowntime')} min={1} keyboard />
            </Form.Item>
            )}
            {isHighway && (
            <Form.Item<EndWorkShiftFormType> label={t('mileageHighway')} rules={[endWorkShiftValidation]} className="mb-1" name="mileageHighway" required>
              <InputNumber size="large" className="w-100" suffix={t('km')} placeholder={t('mileageHighway')} min={1} keyboard />
            </Form.Item>
            )}
            <div className="mt-5 d-flex justify-content-center">
              <Button className="col-10 button-height button" htmlType="submit">
                {t('submitButton')}
              </Button>
            </div>
          </Form>
        )}
      />
    </Modal>
  );
};

export default ModalEndWorkShift;
