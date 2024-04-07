import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useState } from 'react';
import MaskedInput from '@/components/forms/MaskedInput';
import { UserOutlined, PhoneOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  Form, Input, ColorPicker, Radio, Button,
} from 'antd';
import { fetchConfirmCode } from '@/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { userValidation } from '@/validations/validations';
import toast from '@/utilities/toast';
import useErrorHandler from '@/utilities/useErrorHandler';
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
  const dispatch = useAppDispatch();
  const { key, error } = useAppSelector((state) => state.user);

  const { modalOpen, modalClose } = useContext(ModalContext);
  const [isConfirm, setIsConfirm] = useState(false);
  const router = useRouter();

  const [form] = Form.useForm();

  const onFinish = async (userValues: UserSignupType) => {
    setValues(userValues);
    const { payload: { code } } = await dispatch(fetchConfirmCode({ phone: userValues.phone, key })) as { payload: { code: number } };
    if (code === 1) {
      modalOpen('activation', setIsConfirm);
    }
    if (code === 4) {
      toast(tToast('timeNotOverForSms'), 'error');
    }
    if (code === 5) {
      setIsConfirm(true);
    }
    if (code === 6) {
      form.setFields([{ name: 'phone', errors: [tToast('userAlreadyExists')] }]);
    }
  };

  useEffect(() => {
    if (isConfirm) {
      router.push('#car');
      modalClose();
      next();
    }
  }, [isConfirm]);

  useErrorHandler(error);

  return (
    <Form name="user-signup" form={form} initialValues={values} className="signup-form" onFinish={onFinish}>
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
