import { useTranslation } from 'react-i18next';
import MaskedInput from '@/components/forms/MaskedInput';
import { Alert } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { PhoneOutlined } from '@ant-design/icons';
import { Button, Form } from 'antd';
import { loginValidation } from '@/validations/validations';
import routes from '@/routes';
import Helmet from '@/components/Helmet';

type RecoveryType = {
  phone: string;
};

const Recovery = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'recovery' });
  const router = useRouter();

  const onFinish = (values: RecoveryType) => {
    console.log('Received values of form: ', values);
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center anim-show">
      <Helmet title={t('title')} description={t('description')} />
      <div className="col-12 d-flex flex-column align-items-center gap-5">
        <h1>{t('title')}</h1>
        <div className="col-9 d-flex flex-column gap-5">
          <Form
            name="recovery"
            onFinish={onFinish}
          >
            <Form.Item<RecoveryType>
              name="phone"
              rules={[loginValidation]}
            >
              <MaskedInput
                mask="+7 (000) 000-00-00"
                className="input-height"
                prefix={<PhoneOutlined className="site-form-item-icon" />}
                placeholder={t('phone')}
              />
            </Form.Item>
            <div className="d-flex justify-content-end mb-3-5">
              <Alert.Link
                className="text-primary fw-light fs-7"
                onClick={() => router.push(routes.loginPage)}
              >
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
