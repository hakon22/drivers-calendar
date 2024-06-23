import { Modal, Button, Result } from 'antd';
import { useContext, useState } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import type { CalendarProps } from '@/components/Calendar';
import {
  ApiContext, ModalContext, NavbarContext, SubmitContext,
} from '@/components/Context';
import Calendar from '@/components/Calendar';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import toast from '@/utilities/toast';
import routes from '@/routes';
import axios from 'axios';
import { ScheduleSchemaType } from '../../../../server/types/crew/ScheduleSchemaType';

const ModalTakeSickLeaveOrVacation = ({ type }: { type: 'takeSickLeave' | 'takeVacation' }) => {
  const { t } = useTranslation('translation', { keyPrefix: `modals.${type}` });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const [dateValues, setDateValues] = useState<CalendarProps['dateValues']>();

  const [isSuccess, setIsSuccess] = useState(false);

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { closeNavbar } = useContext(NavbarContext);
  const { sendNotification, makeSchedule } = useContext(ApiContext);

  const { token } = useAppSelector((state) => state.user);

  const close = () => {
    if (dateValues?.secondShift) {
      setDateValues({});
    } else {
      modalClose();
    }
  };

  const onFinish = async () => {
    try {
      setIsSubmit(true);
      const { data: { code, notifications, scheduleSchema } } = await axios.post(routes.takeSickLeaveOrVacation, { ...dateValues, type }, {
        headers: { Authorization: `Bearer ${token}` },
      }) as { data: { code: number, notifications: Notification[], scheduleSchema: ScheduleSchemaType } };
      if (code === 1) {
        notifications.forEach((notif) => sendNotification({ ...notif }));
        makeSchedule({ code, scheduleSchema });
        setIsSuccess(true);
      } else if (code === 2) {
        toast(tToast('shiftsNotAvailable'), 'error');
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  const back = () => {
    modalClose();
    closeNavbar();
  };

  return (
    <Modal
      centered
      open
      footer={null}
      styles={{
        content: {
          paddingLeft: '0.25em', paddingRight: '0.25em',
        },
      }}
      onCancel={close}
    >
      {isSuccess ? (
        <Result
          status="success"
          title={t('title')}
          subTitle={t('subTitle')}
          extra={(
            <div className="col-9 d-flex justify-content-center mx-auto">
              <Button className="button button-height" onClick={back}>
                {t('back')}
              </Button>
            </div>
        )}
        />
      ) : (
        <div className="my-4 d-flex flex-column align-items-center gap-3">
          {dateValues?.secondShift ? (
            <>
              <div className="h1">{t('confirmScheduleChange')}</div>
              <div className="w-100 px-3">
                {t('yourShift')}
                <span className="fs-6 fw-bold">{dateValues.firstShift?.locale('ru').format('D MMMM, dddd')}</span>
              </div>
              <div className="w-100 px-3">
                {t('changedShift')}
                <span className="fs-6 fw-bold">{dateValues.secondShift?.locale('ru').format('D MMMM, dddd')}</span>
              </div>
              <div className="mt-4 d-flex justify-content-center">
                <Button type="primary" className="button-height button" onClick={onFinish}>
                  {t('submitButton')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="h1">{t(dateValues?.firstShift ? 'secondShift' : 'firstShift')}</div>
              <Calendar dateValues={dateValues} setDateValues={setDateValues} mode="sickLeave" />
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ModalTakeSickLeaveOrVacation;