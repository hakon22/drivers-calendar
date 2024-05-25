import { Modal, Result, Button } from 'antd';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { selectors } from '@/slices/notificationSlice';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import UserNotificationEnum from '../../../server/types/user/enum/UserNotificationEnum';

const ModalInviteNotification = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteNotification' });

  const { modalClose } = useContext(ModalContext);

  const notifications = useAppSelector(selectors.selectAll);
  const inviteNotifications = notifications.filter((notification) => notification.type === UserNotificationEnum.INVITE);

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <Result
        status="info"
        title={t('title', { inviteNotifications })}
        subTitle={t('subTitle', { inviteNotifications })}
        extra={(
          <div className="mt-5 d-flex justify-content-center">
            <Button className="col-10 button-height button" htmlType="submit">
              {t('start')}
            </Button>
          </div>
        )}
      />
    </Modal>
  );
};

export default ModalInviteNotification;
