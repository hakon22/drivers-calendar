import {
  Modal, Result, Button, Form, Input, ColorPicker,
} from 'antd';
import { Color } from 'antd/es/color-picker';
import { UserOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { fetchInviteSignup } from '@/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, SubmitContext } from '@/components/Context';
import { userValidation } from '@/validations/validations';

const ModalAcceptInvite = () => {
  type UserSignupType = {
    username: string;
    color: string | Color;
  };

  const { t } = useTranslation('translation', { keyPrefix: 'modals.acceptInvite' });
  const dispatch = useAppDispatch();
  const { setIsSubmit } = useContext(SubmitContext);
  const { modalClose } = useContext(ModalContext);

  const { users, cars, temporaryToken } = useAppSelector((state) => state.user);

  const onFinish = ({ username, color }: UserSignupType) => {
    if (temporaryToken && typeof temporaryToken === 'string') {
      setIsSubmit(true);
      dispatch(fetchInviteSignup({ username, color: typeof color !== 'string' ? color.toHexString() : color, temporaryToken }));
      setIsSubmit(false);
      modalClose();
    }
  };

  return (
    <Modal
      centered
      open
      footer={null}
    >
      <Result
        status="info"
        title={t('title', { users })}
        subTitle={t('subTitle', { cars })}
        extra={(
          <Form name="user-signup" className="signup-form text-start" onFinish={onFinish}>
            <Form.Item<UserSignupType> label={t('username')} name="username" rules={[userValidation]} required>
              <Input size="large" prefix={<UserOutlined className="site-form-item-icon" />} placeholder={t('username')} />
            </Form.Item>
            <Form.Item<UserSignupType> name="color" tooltip={{ title: t('colorTooltip'), icon: <QuestionCircleOutlined /> }} rules={[userValidation]} label={t('color')} required>
              <ColorPicker size="large" className="border-button" disabledAlpha />
            </Form.Item>
            <div className="mt-5 d-flex justify-content-center">
              <Button className="col-10 button-height button" htmlType="submit">
                {t('start')}
              </Button>
            </div>
          </Form>
        )}
      />
    </Modal>
  );
};

export default ModalAcceptInvite;
