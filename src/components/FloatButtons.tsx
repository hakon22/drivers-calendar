import { MessageOutlined, UserAddOutlined, BellOutlined } from '@ant-design/icons';
import { FloatButton } from 'antd';
import { useContext } from 'react';
import { selectors } from '@/slices/notificationSlice';
import { useAppSelector } from '@/utilities/hooks';
import { ModalContext } from './Context';
import UserNotificationEnum from '../../server/types/notification/enum/NotificationEnum';

const FloatButtons = () => {
  const { modalOpen } = useContext(ModalContext);

  const notifications = useAppSelector(selectors.selectAll);
  const inviteNotifications = notifications.filter((notification) => notification.type === UserNotificationEnum.INVITE);
  const unreadInviteCount = inviteNotifications.filter(({ isRead }) => !isRead).length;
  const unreadAllCount = notifications.filter(({ isRead }) => !isRead).length;

  const invitationHandler = () => modalOpen('inviteNotification');
  const chatHandler = () => modalOpen('');
  const notificationHandler = () => modalOpen('notifications');

  return (
    <>
      <FloatButton badge={{ count: 3 }} icon={<MessageOutlined />} />
      {inviteNotifications.length ? <FloatButton className="float-button invitation-btn animate__heartBeat" badge={{ count: unreadInviteCount }} onClick={invitationHandler} icon={<UserAddOutlined />} /> : null}
      <FloatButton className="float-button notification-btn" badge={{ count: unreadAllCount - unreadInviteCount }} icon={<BellOutlined />} onClick={notificationHandler} />
    </>
  );
};

export default FloatButtons;
