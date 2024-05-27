/* eslint-disable react/no-unstable-nested-components */
import {
  Modal, Button, Collapse, type CollapseProps,
} from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
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
  const inviteNotifications: CollapseProps['items'] = notifications
    .filter((notification) => notification.type === NotificationEnum.INVITE)
    .map(({ title, description, description2 }, index) => ({
      key: index + 1,
      label: title,
      headerClass: 'p-1',
      style: { backgroundColor: '#DEE3F3' },
      children:
  <>
    <div className="d-flex flex-column align-items-start gap-3 mb-4">
      <span>{description}</span>
      <span>{description2}</span>
    </div>
    <div className="d-flex flex-column align-items-center gap-3">
      <Button className="col-10 mx-auto button-height button" htmlType="submit">
        {t('accept')}
      </Button>
      <Button className="col-10 mx-auto button-height button" style={{ backgroundColor: '#CDD5EC', border: 'none' }} htmlType="submit">
        {t('decline')}
      </Button>
    </div>
  </>,
    }));

  const isReadHandler = (key: string[]) => {
    if (key.length) {
      // async logic
    }
  };

  return (
    <Modal
      centered
      open
      footer={null}
      styles={{ content: { paddingLeft: '0.5em', paddingRight: '0.5em' } }}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-3">
        <div className="h1">{t('invitations')}</div>
        <Collapse
          style={{ width: '95%' }}
          onChange={isReadHandler}
          defaultActiveKey={inviteNotifications.length === 1 ? 1 : undefined}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
          items={inviteNotifications}
        />
      </div>
    </Modal>
  );
};

export default ModalInviteNotification;
