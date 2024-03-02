import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from 'react';
import MaskedInput from '@/components/forms/MaskedInput';
import { Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { loginValidation } from '@/validations/validations';
import routes from '@/routes';
import Helmet from '@/components/Helmet';

type LoginType = {
  phone: string;
  password: string;
};

const Login = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'login' });
  const router = useRouter();

  const onFinish = (values: LoginType) => {
    console.log('Received values of form: ', values);
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <div className="col-12 d-flex flex-column align-items-center gap-5">
        <h1>{t('title')}</h1>
        <div className="col-9 d-flex flex-column gap-5">
          <Form name="login" className="login-form" onFinish={onFinish}>
            <Form.Item<LoginType> name="phone" rules={[loginValidation]}>
              <MaskedInput mask="+7 (000) 000-00-00" className="input-height" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
            </Form.Item>
            <Form.Item<LoginType> name="password" rules={[loginValidation]}>
              <Input.Password className="input-height" prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder={t('password')} />
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
