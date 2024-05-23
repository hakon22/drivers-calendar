import { MessageOutlined, UserAddOutlined, BellOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { useContext } from 'react';
import { selectors } from '@/slices/notificationSlice';
import { useAppSelector } from '@/utilities/hooks';
import { ModalContext } from './Context';
import UserNotificationEnum from '../../server/types/user/enum/UserNotificationEnum';

const FloatButtons = () => {
  const { modalOpen } = useContext(ModalContext);

  const notifications = useAppSelector(selectors.selectAll);
  const inviteNotifications = notifications.filter((notification) => notification.type === UserNotificationEnum.INVITE).length;

  const invitationHandler = () => modalOpen('inviteNotification');
  const chatHandler = () => modalOpen('');
  const notificationHandler = () => modalOpen('');

  return (
    <>
      <FloatButton badge={{ count: 3 }} icon={<MessageOutlined />} />
      {inviteNotifications && <FloatButton className="float-button invitation-btn" badge={{ count: inviteNotifications }} onClick={invitationHandler} icon={<UserAddOutlined />} />}
      <FloatButton className="float-button notification-btn" badge={{ count: 1 }} icon={<BellOutlined />} />
    </>
  );
};

export default FloatButtons;
