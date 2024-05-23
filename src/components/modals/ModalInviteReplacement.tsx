import {
  Modal, Result, Button, Form,
} from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import { useContext, useState } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import toast from '@/utilities/toast';
import { loginValidation } from '@/validations/validations';
import routes from '@/routes';
import axios from 'axios';
import MaskedInput from '../forms/MaskedInput';
import phoneTransform from '../../../server/utilities/phoneTransform';

const ModalInviteReplacement = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteReplacement' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const { t: tValidation } = useTranslation('translation', { keyPrefix: 'validation' });

  const [isSuccess, setIsSuccess] = useState(false);

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { closeNavbar } = useContext(NavbarContext);

  const { token } = useAppSelector((state) => state.user);
  const { users } = useAppSelector((state) => state.crew);

  const [form] = Form.useForm();

  const onFinish = async ({ phone }: { phone: string }) => {
    try {
      setIsSubmit(true);
      if (users.find((user) => user.phone === phoneTransform(phone))) {
        toast(tToast('userInYouCrew'), 'error');
        form.setFields([{ name: 'phone', errors: [tValidation('userInCrew')] }]);
      } else {
        const { data: { code } } = await axios.post(routes.inviteReplacement, { phone }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (code === 1) {
          setIsSuccess(true);
        } else if (code === 2) {
          form.setFields([{ name: 'phone', errors: [tValidation('userInCrew')] }]);
        }
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
      onCancel={modalClose}
    >
      {isSuccess ? (
        <Result
          status="success"
          title={t('title')}
          subTitle={t('subTitle')}
          extra={(
            <div className="col-9 d-flex mx-auto">
              <Button className="button button-height" onClick={back}>
                {t('back')}
              </Button>
            </div>
        )}
        />
      ) : (
        <div className="col-12 my-4 d-flex flex-column align-items-center gap-3">
          <Form name="inviteReplacement" className="col-10" onFinish={onFinish} form={form}>
            <Form.Item<{ phone: string }> name="phone" rules={[loginValidation]}>
              <MaskedInput mask="+7 (000) 000-00-00" className="button-height" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
            </Form.Item>
            <div className="d-flex col-12">
              <Button type="primary" htmlType="submit" className="w-100 button">
                {t('submitButton')}
              </Button>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default ModalInviteReplacement;
