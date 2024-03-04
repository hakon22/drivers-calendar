import { useTranslation } from 'react-i18next';
import MaskedInput from '@/components/forms/MaskedInput';
import { UserOutlined, PhoneOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  Form, Input, ColorPicker, Radio, Button,
} from 'antd';
import { userValidation } from '@/validations/validations';

export type UserSignupType = {
  phone: string;
  username: string;
  schedule: string;
  color: string;
};

type UserSignupProps = {
  values: UserSignupType,
  setValues: React.Dispatch<React.SetStateAction<UserSignupType>>;
  next: () => void;
};

const UserSignup = ({ values, setValues, next }: UserSignupProps) => {
  const { t } = useTranslation('translation', { keyPrefix: 'signup.userForm' });
  const router = useRouter();

  const onFinish = (userValues: UserSignupType) => {
    setValues(userValues);
    router.push('#car');
    next();
  };

  return (
    <Form name="user-signup" initialValues={values} className="signup-form" onFinish={onFinish}>
      <Form.Item<UserSignupType> name="phone" rules={[userValidation]} required status="success">
        <MaskedInput mask="+7 (000) 000-00-00" size="large" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
      </Form.Item>
      <Form.Item<UserSignupType> name="username" rules={[userValidation]} required>
        <Input size="large" prefix={<UserOutlined className="site-form-item-icon" />} placeholder={t('username')} />
      </Form.Item>
      <Form.Item<UserSignupType> name="schedule" label={t('schedule')} rules={[userValidation]} required>
        <Radio.Group size="large" className="border-button">
          <Radio.Button className="border-button" value="2/2">{t('2/2')}</Radio.Button>
          <Radio.Button className="border-button" value="1/2">{t('1/2')}</Radio.Button>
          <Radio.Button className="border-button" value="1/3">{t('1/3')}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item<UserSignupType> name="color" tooltip={{ title: t('colorTooltip'), icon: <QuestionCircleOutlined /> }} rules={[userValidation]} label={t('color')} required>
        <ColorPicker size="large" className="border-button" onChangeComplete={(color) => setValues((prevValues) => ({ ...prevValues, color: color.toHexString() }))} />
      </Form.Item>
      <div className="mt-5 d-flex justify-content-center">
        <Button className="col-10 button-height button" htmlType="submit">
          {t('next')}
        </Button>
      </div>
    </Form>
  );
};

export default UserSignup;
