import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import MaskedInput from '@/components/forms/MaskedInput';
import { Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { loginValidation } from '@/validations/validations';
import { AuthContext, ModalContext, SubmitContext } from '@/components/Context';
import routes from '@/routes';
import BackButton from '@/components/BackButton';
import Helmet from '@/components/Helmet';
import { useAppDispatch } from '@/utilities/hooks';
import { fetchLogin } from '@/slices/userSlice';

type LoginType = {
  phone: string;
  password: string;
};

const Login = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'login' });
  const { t: tValidation } = useTranslation('translation', { keyPrefix: 'validation' });
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();
  const { setIsSubmit } = useContext(SubmitContext);
  const { modalOpen } = useContext(ModalContext);
  const { loggedIn } = useContext(AuthContext);

  const onFinish = async (values: LoginType) => {
    setIsSubmit(true);
    const { payload: { code } } = await dispatch(fetchLogin(values)) as { payload: { code: number } };
    if (code === 2) {
      form.setFields([{ name: 'password', errors: [tValidation('incorrectPassword')] }]);
    } else if (code === 3) {
      form.setFields([{ name: 'phone', errors: [tValidation('userNotExists')] }]);
    } else if (code === 4) {
      modalOpen('acceptInvite');
    }
    setIsSubmit(false);
  };

  return !loggedIn && (
    <div className="d-flex justify-content-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <BackButton title={t('prev')} />
      <div className="my-5 col-12 d-flex flex-column align-items-center gap-5">
        <h1>{t('title')}</h1>
        <div className="col-10">
          <Form name="login" form={form} className="login-form" onFinish={onFinish}>
            <Form.Item<LoginType> name="phone" rules={[loginValidation]}>
              <MaskedInput mask="+7 (000) 000-00-00" size="large" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
            </Form.Item>
            <Form.Item<LoginType> name="password" rules={[loginValidation]}>
              <Input.Password size="large" prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder={t('password')} />
            </Form.Item>
            <div className="d-flex justify-content-end mb-3-5">
              <Alert.Link className="text-primary fw-light fs-7" onClick={() => router.push(routes.recoveryPage)}>
                {t('forgotPassword')}
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

export default Login;
