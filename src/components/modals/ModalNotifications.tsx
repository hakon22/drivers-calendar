/* eslint-disable react/no-unstable-nested-components */
import {
  Modal, Result, Button, Collapse, type CollapseProps,
} from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { selectors } from '@/slices/notificationSlice';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import NotificationEnum from '../../../server/types/notification/enum/NotificationEnum';

const ModalNotifications = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteNotification' });
  const dispatch = useAppDispatch();

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
      <Collapse
        bordered={false}
        expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
        items={[{
          key: '1',
          label: 'Приглашения',
          children: <p>{inviteNotifications[0].message}</p>,
        }]}
      />
      <Result
        status="info"
        title={t('title', { inviteNotifications })}
        subTitle={t('subTitle', { inviteNotifications })}
        extra={(
          <div className="mt-5 d-flex justify-content-center">
            <Button className="col-10 button-height button" htmlType="submit">
              {t('accept')}
            </Button>
            <Button className="col-10 button-height button" htmlType="submit">
              {t('decline')}
            </Button>
          </div>
        )}
      />
    </Modal>
  );
};

export default ModalNotifications;
