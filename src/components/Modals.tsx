/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal, Result, Button, Form,
} from 'antd';
import { useContext } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { confirmCodeValidation } from '@/validations/validations';
import { ModalContext } from '@/components/Context';
import { LoginButton } from '@/pages/welcome';
import routes from '@/routes';
import MaskedInput from './forms/MaskedInput';

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

const ModalConfirmPhone = ({ setState }: { setState?: (arg: unknown) => void }) => {
  type ConfirmCodeType = {
    code: number;
  };

  const { t } = useTranslation('translation', { keyPrefix: 'modals.confirmPhone' });
  const { modalClose } = useContext(ModalContext);

  const onFinish = async ({ code }: ConfirmCodeType) => {
    const localData = window.localStorage.getItem('confirmData');
    if (localData && setState) {
      const { phone, key } = JSON.parse(localData) as { phone: string, key: string };
      const { data } = await axios.post(routes.confirmPhone, { phone, key, code }) as { data: { code: number } };
      if (data.code === 2) {
        setState(true);
      }
    }
  };

  return (
    <Modal centered open footer={null} onCancel={modalClose} className="reduced-padding">
      <Form name="confirmPhone" onFinish={onFinish} className="d-flex flex-column align-items-center my-3">
        <span className="mb-3 fs-6 text-center">На ваш номер телефона был отправлен код подтверждения</span>
        <Form.Item<ConfirmCodeType> name="code" rules={[confirmCodeValidation]} className="d-flex justify-content-center mb-5">
          <MaskedInput mask="0000" className="button-height" placeholder={t('code')} />
        </Form.Item>
        <div className="d-flex col-6">
          <Button type="primary" htmlType="submit" className="w-100 button">
            {t('submitButton')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

ModalConfirmPhone.defaultProps = { setState: undefined };

const Modals = () => {
  const { show } = useContext(ModalContext);
  const setState = typeof show === 'object' ? show.modalSetState : undefined;

  const modals = {
    none: null,
    signup: <ModalSignup />,
    activation: <ModalConfirmPhone setState={setState} />,
  };

  return typeof show === 'object' ? modals[show.show] : modals[show];
};

export default Modals;
