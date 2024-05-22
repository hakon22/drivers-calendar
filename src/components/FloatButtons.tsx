import { MessageOutlined, UserAddOutlined, BellOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { useContext } from 'react';
import { ModalContext } from './Context';

const FloatButtons = () => {
  const { modalOpen } = useContext(ModalContext);

  const invitationHandler = () => modalOpen('inviteNotification');
  const chatHandler = () => modalOpen('');
  const notificationHandler = () => modalOpen('');

  return (
    <>
      <FloatButton badge={{ count: 3 }} icon={<MessageOutlined />} />
      <FloatButton className="float-button invitation-btn" badge={{ count: 1 }} onClick={invitationHandler} icon={<UserAddOutlined />} />
      <FloatButton className="float-button notification-btn" badge={{ count: 1 }} icon={<BellOutlined />} />
    </>
  );
};

export default FloatButtons;
