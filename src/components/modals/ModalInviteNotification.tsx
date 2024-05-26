/* eslint-disable react/no-unstable-nested-components */
import { Modal, Button } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { selectors } from '@/slices/notificationSlice';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import NotificationEnum from '../../../server/types/notification/enum/NotificationEnum';

const ModalInviteNotification = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteNotification' });

  const { modalClose } = useContext(ModalContext);

  const notifications = useAppSelector(selectors.selectAll);
  const inviteNotifications = notifications.filter((notification) => notification.type === NotificationEnum.INVITE);

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-3">
        <div className="h1">{t('invitations')}</div>
        <p className="fs-6">{inviteNotifications[0].title}</p>
        <div className="d-flex flex-column align-items-start gap-3 mb-3">
          <span>{inviteNotifications[0].description}</span>
          <span>{inviteNotifications[0].description2}</span>
        </div>
        <Button className="col-10 mx-auto button-height button" htmlType="submit">
          {t('accept')}
        </Button>
        <Button className="col-10 mx-auto button-height button" style={{ backgroundColor: '#CDD5EC', border: 'none' }} htmlType="submit">
          {t('decline')}
        </Button>
      </div>
    </Modal>
  );
};

export default ModalInviteNotification;
