/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal, Result, Button, Form, Progress, Spin,
} from 'antd';
import { useContext, useState, useEffect } from 'react';
import { fetchConfirmCode } from '@/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import VerificationInput from 'react-verification-input';
import { ModalContext } from '@/components/Context';
import { LoginButton } from '@/pages/welcome';
import toast from '@/utilities/toast';
import useErrorHandler from '@/utilities/useErrorHandler';

const ModalSignup = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.signup' });
  const { modalClose } = useContext(ModalContext);

  return (
    <Modal centered open footer={null} onCancel={modalClose}>
      <Result
        status="success"
        title={t('title')}
        subTitle={t('subTitle')}
        extra={(
          <div className="col-9 d-flex mx-auto">
            <LoginButton title={t('loginButton')} className="button button-height w-100" />
          </div>
        )}
      />
    </Modal>
  );
};

const ModalConfirmPhone = ({ setState }: { setState: (arg: boolean) => void }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.confirmPhone' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const { t: tValidation } = useTranslation('translation', { keyPrefix: 'validation' });
  const dispatch = useAppDispatch();
  const {
    key, loadingStatus, error, phone = '',
  } = useAppSelector((state) => state.user);
  const { modalClose } = useContext(ModalContext);

  const [timer, setTimer] = useState<number>(59);
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onFinish = async (codeValue: string) => {
    const { payload: { code } } = await dispatch(fetchConfirmCode({ phone, key, code: codeValue })) as { payload: { code: number } };
    if (code === 2) {
      setState(true);
    }
    if (code === 3) {
      setValue('');
      setErrorMessage(tValidation('incorrectCode'));
    }
    if (code === 4) {
      setValue('');
      setErrorMessage(tValidation('timeNotOver'));
    }
  };

  const repeatSMS = async () => {
    const { payload: { code } } = await dispatch(fetchConfirmCode({ phone })) as { payload: { code: number } };
    if (code === 1) {
      setValue('');
      setErrorMessage('');
      setTimer(59);
      toast(tToast('sendSmsSuccess'), 'success');
    } else {
      modalClose();
      toast(tToast('sendSmsError'), 'error');
    }
  };

  useEffect(() => {
    if (timer) {
      const timerAlive = setTimeout(setTimer, 1000, timer - 1);
      return () => clearTimeout(timerAlive);
    }
    return undefined;
  }, [timer]);

  useErrorHandler(error);

  return (
    <Modal centered open footer={null} onCancel={modalClose} className="reduced-padding">
      <Spin tip={t('loading')} spinning={loadingStatus !== 'finish'} fullscreen size="large" />
      <Form name="confirmPhone" onFinish={onFinish} className="d-flex flex-column align-items-center my-4">
        <span className="mb-3 h1 text-center">{t('h1')}</span>
        <span className="mb-3-5 text-center">{t('enterTheCode')}</span>
        <div className="d-flex justify-content-center mb-5 col-10 position-relative">
          <VerificationInput
            validChars="0-9"
            value={value}
            inputProps={{ inputMode: 'numeric' }}
            length={4}
            placeholder="X"
            classNames={{
              container: 'd-flex gap-3',
              character: 'verification-character',
            }}
            autoFocus
            onComplete={onFinish}
            onChange={setValue}
          />
          {error && <div className="error-message anim-show">{errorMessage}</div>}
        </div>
        <p className="text-muted">{t('didntReceive')}</p>
        {timer ? (
          <div>
            <span className="text-muted">{t('timerCode', { count: timer })}</span>
            <Progress showInfo={false} />
          </div>
        ) : <Button className="border-0 text-muted" style={{ boxShadow: 'unset' }} onClick={repeatSMS}>{t('sendAgain')}</Button>}
      </Form>
    </Modal>
  );
};

const Modals = () => {
  const { show } = useContext(ModalContext);
  const setState = typeof show === 'object' ? show.modalSetState : undefined;

  const modals = {
    none: null,
    signup: <ModalSignup />,
    activation: setState ? <ModalConfirmPhone setState={setState} /> : null,
  };

  return typeof show === 'object' ? modals[show.show] : modals[show];
};

export default Modals;
