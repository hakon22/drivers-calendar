/* eslint-disable react/no-unstable-nested-components */
import {
  Modal, Button, Collapse, type CollapseProps,
} from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { selectors, fetchNotificationReadUpdate, fetchNotificationRemove } from '@/slices/notificationSlice';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import NotificationEnum from '../../../server/types/notification/enum/NotificationEnum';

const ModalInviteNotification = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteNotification' });
  const dispatch = useAppDispatch();

  const { modalClose } = useContext(ModalContext);

  const { token } = useAppSelector((state) => state.user);
  const notifications = useAppSelector(selectors.selectAll);

  const isReadHandler = (key: string | string[]) => {
    if (key.length) {
      const id = +key[0];
      if (!notifications.find((notification) => notification.id === id)?.isRead) {
        dispatch(fetchNotificationReadUpdate({ id, token }));
      }
    }
  };

  const accept = (id: number) => dispatch(fetchNotificationReadUpdate({ id, token }));
  const decline = (id: number) => dispatch(fetchNotificationRemove({ id, token }));

  const inviteNotifications: CollapseProps['items'] = notifications
    .filter((notification) => notification.type === NotificationEnum.INVITE)
    .map(({
      id, title, description, description2, isRead,
    }) => {
      const headerClass = cn('p-1 d-flex align-items-center', { 'fw-bold': !isRead });
      return {
        key: id,
        label: title,
        headerClass,
        style: { backgroundColor: '#DEE3F3', width: '100%' },
        children:
  <>
    <div className="d-flex flex-column align-items-start gap-3 mb-4">
      <span>{description}</span>
      <span>{description2}</span>
    </div>
    <div className="d-flex flex-column align-items-center gap-3">
      <Button className="col-10 mx-auto button-height button" htmlType="submit" onClick={() => accept(id)}>
        {t('accept')}
      </Button>
      <Button
        className="col-10 mx-auto button-height button"
        style={{ backgroundColor: '#CDD5EC', border: 'none' }}
        htmlType="submit"
        onClick={() => decline(id)}
      >
        {t('decline')}
      </Button>
    </div>
  </>,
      };
    })
    .sort((a, b) => b.key - a.key);

  return (
    <Modal
      centered
      open
      footer={null}
      styles={{
        content: {
          paddingLeft: '0.5em', paddingRight: '0.5em', maxHeight: '90vh', overflow: 'auto',
        },
      }}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-3">
        <div className="h1">{t('invitations')}</div>
        <Collapse
          style={{ width: '95%' }}
          className="d-flex flex-column align-items-center gap-2"
          accordion
          bordered
          onChange={isReadHandler}
          defaultActiveKey={inviteNotifications.length === 1 ? 1 : undefined}
          expandIcon={({ isActive }) => <CaretRightOutlined className="d-flex align-items-center" rotate={isActive ? 90 : 0} />}
          items={inviteNotifications}
        />
      </div>
    </Modal>
  );
};

export default ModalInviteNotification;
