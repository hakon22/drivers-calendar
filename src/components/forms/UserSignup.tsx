import { useTranslation } from 'react-i18next';
import MaskedInput from '@/components/forms/MaskedInput';
import { UserOutlined, PhoneOutlined } from '@ant-design/icons';
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

  const onFinish = (userValues: UserSignupType) => {
    setValues(userValues);
    next();
  };

  return (
    <Form name="user-signup" initialValues={values} className="signup-form" onFinish={onFinish}>
      <Form.Item<UserSignupType> name="phone" rules={[userValidation]} required>
        <MaskedInput mask="+7 (000) 000-00-00" className="input-height" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
      </Form.Item>
      <Form.Item<UserSignupType> name="username" rules={[userValidation]} required>
        <Input className="input-height" prefix={<UserOutlined className="site-form-item-icon" />} placeholder={t('username')} />
      </Form.Item>
      <Form.Item<UserSignupType> name="schedule" label={t('schedule')} rules={[userValidation]} required>
        <Radio.Group size="large" className="border-button">
          <Radio.Button className="border-button" value="2/2">{t('2/2')}</Radio.Button>
          <Radio.Button className="border-button" value="1/2">{t('1/2')}</Radio.Button>
          <Radio.Button className="border-button" value="1/3">{t('1/3')}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item<UserSignupType> name="color" rules={[userValidation]} label={t('color')} required>
        <ColorPicker className="border-button" onChangeComplete={(color) => setValues((prevValues) => ({ ...prevValues, color: color.toHexString() }))} />
      </Form.Item>
      <div className="mt-4 d-flex justify-content-center">
        <Button className="input-height border-button" htmlType="submit">
          {t('next')}
        </Button>
      </div>
    </Form>
  );
};

export default UserSignup;
