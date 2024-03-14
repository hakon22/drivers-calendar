import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import MaskedInput from '@/components/forms/MaskedInput';
import { UserOutlined, PhoneOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  Form, Input, ColorPicker, Radio, Button,
} from 'antd';
import { userValidation } from '@/validations/validations';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import routes from '@/routes';
import { ModalContext } from '../Context';

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
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { modalOpen, modalClose } = useContext(ModalContext);
  const [modalResponse, setModalResponse] = useState<{ code: number, key: string }>();
  const router = useRouter();

  const onFinish = async (userValues: UserSignupType) => {
    try {
      setValues(userValues);
      const { data } = await axios.post(routes.confirmPhone, { phone: userValues.phone }) as
        { data: { code: number, key: string, oldKey?: string } };
      if (data.code === 1) {
        if (data.oldKey) {
          window.localStorage.removeItem(data.oldKey);
        }
        window.localStorage.setItem('confirmData', JSON.stringify({ phone: userValues.phone, key: data.key }));
        modalOpen('activation', setModalResponse);
      }
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  useEffect(() => {
    if (modalResponse && modalResponse.code === 2 && modalResponse.key) {
      window.localStorage.removeItem(modalResponse.key);
      router.push('#car');
      modalClose();
      next();
    }
  }, [modalResponse?.code]);

  return (
    <Form name="user-signup" initialValues={values} className="signup-form" onFinish={onFinish}>
      <Form.Item<UserSignupType> name="phone" rules={[userValidation]} required>
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
        <ColorPicker size="large" className="border-button" disabledAlpha onChangeComplete={(color) => setValues((prevValues) => ({ ...prevValues, color: color.toHexString() }))} />
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
