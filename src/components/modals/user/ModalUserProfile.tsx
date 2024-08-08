import {
  Modal, Button, Form, Input, ColorPicker,
  Checkbox,
} from 'antd';
import { useContext, useState, useEffect } from 'react';
import { Color } from 'antd/es/color-picker';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import {
  UserOutlined, PhoneOutlined, QuestionCircleOutlined, LockOutlined,
} from '@ant-design/icons';
import { ModalContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import toast from '@/utilities/toast';
import routes from '@/routes';
import { profileValidation } from '@/validations/validations';
import axios from 'axios';
import MaskedInput from '@/components/forms/MaskedInput';
import { isEmpty } from 'lodash';
import { fetchConfirmCode } from '@/slices/userSlice';
import type { UserProfileType } from '@/types/User';
import ModalConfirmPhone from './ModalConfirmPhone';
import RolesEnum from '../../../../server/types/user/enum/RolesEnum';

const ModalUserProfile = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.userProfile' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const { t: tValidation } = useTranslation('translation', { keyPrefix: 'validation' });

  const {
    username, phone, color, key, isRoundCalendarDays, role,
  } = useAppSelector((state) => state.user);

  const dispatch = useAppDispatch();

  const [updateValues, setUpdateValues] = useState<UserProfileType>();
  const [phoneConfirm, setPhoneConfirm] = useState<string>();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);

  const initialValues: UserProfileType = {
    username: username as string,
    phone: phone as string,
    color: color as string,
    password: '',
    confirmPassword: '',
    oldPassword: '',
    isRoundCalendarDays,
  };

  const [form] = Form.useForm();

  const updateProfile = async (changedValues: UserProfileType) => {
    if (changedValues?.color) {
      changedValues.color = (changedValues.color as unknown as Color).toHexString();
    }
    const { data } = await axios.post(routes.changeUserProfile, { ...changedValues, key }) as { data: { code: number } };
    if (data.code === 1) {
      setUpdateValues(undefined);
      setPhoneConfirm(undefined);
      setIsConfirmed(false);
      form.setFieldsValue({ confirmPassword: '', oldPassword: '', password: '' });
      toast(tToast('changeProfileSuccess'), 'success');
    }
    if (data.code === 2) {
      form.setFields([{ name: 'oldPassword', errors: [tValidation('incorrectPassword')] }]);
    }
    if (data.code === 6) {
      form.setFields([{ name: 'phone', errors: [tToast('userAlreadyExists')] }]);
    }
  };

  const onFinish = async (values: UserProfileType) => {
    try {
      setIsSubmit(true);
      const initialObject: UserProfileType = {};

      const changedValues = Object.keys(values).reduce((acc, keyObj) => {
        if (initialValues[keyObj] === values[keyObj]) {
          return acc;
        }
        return { ...acc, [keyObj]: values[keyObj] };
      }, initialObject);

      if (isEmpty(changedValues)) { // если ничего не изменилось, отменяем изменение
        modalClose();
      } else {
        setUpdateValues(changedValues);
        if (changedValues.phone && !phoneConfirm) {
          const { payload: { code } } = await dispatch(fetchConfirmCode({ phone: changedValues.phone as string, key })) as { payload: { code: number } };
          if (code === 1) {
            setPhoneConfirm(changedValues.phone as string);
          }
          if (code === 4) {
            toast(tToast('timeNotOverForSms'), 'error');
          }
          if (code === 5) {
            setIsConfirmed(true);
          }
          if (code === 6) {
            form.setFields([{ name: 'phone', errors: [tToast('userAlreadyExists')] }]);
          }
        } else {
          await updateProfile(changedValues);
        }
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  useEffect(() => {
    if (isConfirmed && updateValues) {
      updateProfile(updateValues);
    }
  }, [isConfirmed]);

  const password = Form.useWatch('password', form);

  return phoneConfirm && !isConfirmed ? <ModalConfirmPhone setState={setIsConfirmed} newPhone={phoneConfirm} /> : (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <div className="my-4">
        <div className="h1">{t('title')}</div>
        <Form name="user-profile" form={form} initialValues={initialValues} className="my-4" onFinish={onFinish}>
          <Form.Item<UserProfileType> name="phone" rules={[profileValidation]}>
            <MaskedInput mask="+7 (000) 000-00-00" size="large" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
          </Form.Item>
          <Form.Item<UserProfileType> name="username" rules={[profileValidation]}>
            <Input size="large" prefix={<UserOutlined className="site-form-item-icon" />} placeholder={t('username')} />
          </Form.Item>
          <Form.Item<UserProfileType> name="password" rules={[profileValidation]}>
            <Input.Password size="large" prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder="••••••" />
          </Form.Item>
          {password && (
            <>
              <Form.Item<UserProfileType>
                name="confirmPassword"
                rules={[
                  profileValidation,
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(tValidation('mastMatch')));
                    },
                  }),
                ]}
                required
              >
                <Input.Password size="large" prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder={t('confirmPassword')} />
              </Form.Item>
              <Form.Item<UserProfileType> name="oldPassword" rules={[profileValidation]} required>
                <Input.Password size="large" prefix={<LockOutlined className="site-form-item-icon" />} type="password" placeholder={t('oldPassword')} />
              </Form.Item>
            </>
          )}
          {role !== RolesEnum.ADMIN ? (
            <Form.Item<UserProfileType> name="color" tooltip={{ title: t('colorTooltip'), icon: <QuestionCircleOutlined /> }} rules={[profileValidation]} label={t('color')}>
              <ColorPicker size="large" className="border-button" disabledAlpha />
            </Form.Item>
          ) : null}
          <Form.Item<UserProfileType> name="isRoundCalendarDays" valuePropName="checked" rules={[profileValidation]}>
            <Checkbox>{t('isRoundCalendarDays')}</Checkbox>
          </Form.Item>
          <div className="mt-4 d-flex justify-content-center col-10 mx-auto">
            <Button type="primary" htmlType="submit" className="w-100 button-height button">
              {t('submitButton')}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default ModalUserProfile;
