import { useTranslation } from 'react-i18next';
import MaskedInput from '@/components/forms/MaskedInput';
import { Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { PhoneOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { useContext } from 'react';
import { ModalContext, SubmitContext, AuthContext } from '@/components/Context';
import { loginValidation } from '@/validations/validations';
import routes from '@/routes';
import Helmet from '@/components/Helmet';
import BackButton from '@/components/BackButton';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import axios from 'axios';

type RecoveryType = {
  phone: string;
};

const Recovery = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'recovery' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const { t: tValidation } = useTranslation('translation', { keyPrefix: 'validation' });
  const router = useRouter();

  const [form] = Form.useForm();
  const { modalOpen } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { loggedIn } = useContext(AuthContext);

  const onFinish = async (values: RecoveryType) => {
    try {
      setIsSubmit(true);
      const { data: { code } } = await axios.post(routes.recoveryPassword, values);
      if (code === 1) {
        modalOpen('recovery');
      } else if (code === 2) {
        form.setFields([{ name: 'phone', errors: [tValidation('userNotExists')] }]);
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  return !loggedIn && (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <BackButton title={t('prev')} />
      <div className="my-5 col-12 d-flex flex-column align-items-center gap-5">
        <h1>{t('title')}</h1>
        <div className="col-10">
          <Form name="recovery" form={form} onFinish={onFinish}>
            <Form.Item<RecoveryType> name="phone" rules={[loginValidation]}>
              <MaskedInput mask="+7 (000) 000-00-00" className="button-height" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
            </Form.Item>
            <div className="d-flex justify-content-end mb-3-5">
              <Alert.Link className="text-primary fw-light fs-7" onClick={() => router.push(routes.loginPage)}>
                {t('rememberPassword')}
              </Alert.Link>
            </div>
            <div className="d-flex col-12">
              <Button type="primary" htmlType="submit" className="w-100 button">
                {t('submitButton')}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Recovery;
