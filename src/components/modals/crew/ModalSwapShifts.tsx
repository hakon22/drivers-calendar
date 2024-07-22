import { Modal, Button, Result } from 'antd';
import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CalendarProps } from '@/components/Calendar';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';
import Calendar from '@/components/Calendar';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import routes from '@/routes';
import axios from 'axios';

const ModalSwapShifts = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.swapShifts' });
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
      const { data: { code } } = await axios.post(routes.swapShift, dateValues);
      if (code === 1) {
        setIsSuccess(true);
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
              <Calendar dateValues={dateValues} setDateValues={setDateValues} mode="shift" />
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default ModalSwapShifts;
