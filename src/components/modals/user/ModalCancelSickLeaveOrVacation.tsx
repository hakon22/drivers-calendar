import { Modal, Button } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import toast from '@/utilities/toast';
import routes from '@/routes';
import axios from 'axios';

const ModalCancelSickLeaveOrVacation = ({ type }: { type: 'cancelSickLeave' | 'cancelVacation' }) => {
  const { t } = useTranslation('translation', { keyPrefix: `modals.${type}` });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { id } = useAppSelector((state) => state.user);
  const { reservedDays } = useAppSelector((state) => state.crew);

  const userReservedDays = reservedDays.find((reservedDay) => reservedDay.userId === id);

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { closeNavbar } = useContext(NavbarContext);

  const back = () => {
    modalClose();
    closeNavbar();
  };

  const onFinish = async () => {
    try {
      setIsSubmit(true);
      const { data } = await axios.post(routes.cancelSickLeaveOrVacation, { type }) as { data: { code: number } };
      if (data.code === 1) {
        toast(tToast(type), 'success');
      } else if (data.code === 2) {
        toast(tToast('reservedDaysNotAvailable'), 'error');
      }
      setIsSubmit(false);
      back();
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  return userReservedDays && (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-3">

        <div className="h1">{t('currentReservedDays')}</div>
        <div className="w-100 px-3">
          {t('yourShift')}
          <span className="fs-6 fw-bold">{dayjs(userReservedDays.reserved_days[0], 'DD-MM-YYYY').locale('ru').format('D MMMM, dddd')}</span>
        </div>
        <div className="w-100 px-3">
          {t('changedShift')}
          <span className="fs-6 fw-bold">{dayjs(userReservedDays.reserved_days[userReservedDays.reserved_days.length - 1], 'DD-MM-YYYY').locale('ru').format('D MMMM, dddd')}</span>
        </div>
        <div className="mt-4 d-flex justify-content-center">
          <Button type="primary" className="button-height button" onClick={onFinish}>
            {t('submitButton')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCancelSickLeaveOrVacation;
