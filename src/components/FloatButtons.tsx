import {
  MessageOutlined, UserAddOutlined, BellOutlined, DoubleLeftOutlined, DoubleRightOutlined,
} from '@ant-design/icons';
import { Button, FloatButton } from 'antd';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import dayjs from 'dayjs';
import { selectors } from '@/slices/notificationSlice';
import { useAppSelector } from '@/utilities/hooks';
import { ModalContext } from './Context';
import UserNotificationEnum from '../../server/types/notification/enum/NotificationEnum';

const FloatButtons = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.endWorkShift' });
  const { modalOpen } = useContext(ModalContext);

  const { id } = useAppSelector((state) => state.user);
  const {
    id: crewId, chat = [], schedule_schema: scheduleSchema, activeCar,
  } = useAppSelector((state) => state.crew);

  const today = dayjs().format('DD-MM-YYYY');
  const isMyShift = scheduleSchema?.[today]?.id === id;

  const notifications = useAppSelector(selectors.selectAll);
  const unreadChatMessages = chat.filter((message) => !message.readBy.includes(id as number));

  const inviteNotifications = notifications.filter((notification) => notification.type === UserNotificationEnum.INVITE);
  const unreadInviteCount = inviteNotifications.filter(({ isRead }) => !isRead).length;
  const unreadAllCount = notifications.filter(({ isRead }) => !isRead).length;

  const invitationHandler = () => modalOpen('inviteNotification');
  const chatHandler = () => modalOpen('chat');
  const notificationHandler = () => modalOpen('notifications');
  const endWorkShiftHandler = () => modalOpen('endWorkShift');

  return (
    <>
      {crewId && <FloatButton badge={{ count: unreadChatMessages.length }} icon={<MessageOutlined />} onClick={chatHandler} />}
      {inviteNotifications.length ? <FloatButton className="float-button invitation-btn animate__heartBeat" badge={{ count: unreadInviteCount }} onClick={invitationHandler} icon={<UserAddOutlined />} /> : null}
      <FloatButton className="float-button notification-btn" badge={{ count: unreadAllCount - unreadInviteCount }} icon={<BellOutlined />} onClick={notificationHandler} />
      {isMyShift && activeCar && (
      <Button className="float-button end-work-shift-btn button-height button" onClick={endWorkShiftHandler}>
        <DoubleRightOutlined className="fs-6 me-3" />
        {t('floatButton')}
        <DoubleLeftOutlined className="fs-6 ms-3" />
      </Button>
      )}
    </>
  );
};

export default FloatButtons;
