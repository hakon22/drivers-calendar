import { Modal, Button, Result } from 'antd';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CalendarProps } from '@/components/Calendar';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';
import Calendar from '@/components/Calendar';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import toast from '@/utilities/toast';
import routes from '@/routes';
import axios from 'axios';

const ModalTakeSickLeaveOrVacation = ({ type }: { type: 'takeSickLeave' | 'takeVacation' }) => {
  const { t } = useTranslation('translation', { keyPrefix: `modals.${type}` });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const [dateValues, setDateValues] = useState<CalendarProps['dateValues']>();

  const [isSuccess, setIsSuccess] = useState(false);

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { closeNavbar } = useContext(NavbarContext);

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
      const { data } = await axios.post(routes.takeSickLeaveOrVacation, { ...dateValues, type }) as { data: { code: number } };
      if (data.code === 1) {
        setIsSuccess(true);
      } else if (data.code === 2) {
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
