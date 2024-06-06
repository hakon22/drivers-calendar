/* eslint-disable react/no-unstable-nested-components */
import {
  Modal, Button, Collapse, type CollapseProps,
} from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useContext, useEffect } from 'react';
import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { selectors, fetchNotificationReadUpdate, fetchNotificationRemove } from '@/slices/notificationSlice';
import { useTranslation } from 'react-i18next';
import { ModalContext, SubmitContext } from '@/components/Context';
import { fetchAcceptInvitation } from '@/slices/userSlice';
import toast from '@/utilities/toast';
import NotificationEnum from '../../../../server/types/notification/enum/NotificationEnum';

const ModalInviteNotifications = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteNotification' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const dispatch = useAppDispatch();

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);

  const { token } = useAppSelector((state) => state.user);
  const notifications = useAppSelector(selectors.selectAll);

  const filteredNotifications = notifications.filter((notification) => notification.type === NotificationEnum.INVITE);

  const isReadHandler = (key: string | string[]) => {
    if (key.length) {
      const id = +key[0];
      if (!notifications.find((notification) => notification.id === id)?.isRead) {
        dispatch(fetchNotificationReadUpdate({ id, token }));
      }
    }
  };

  const decline = (id: number) => dispatch(fetchNotificationRemove({ id, token }));

  const accept = async (id: number) => {
    setIsSubmit(true);
    const { payload: { code } } = await dispatch(fetchAcceptInvitation({
      id,
      authorId: filteredNotifications.find((notification) => notification.id === id)?.authorId,
      token,
    })) as { payload: { code: number } };
    if (code === 1) {
      modalClose();
      decline(id);
    } else if (code === 2) {
      toast(tToast('invalidInvitation'), 'error');
      decline(id);
    } else if (code === 3) {
      toast(tToast('alreadyOnCrew'), 'error');
    }
    setIsSubmit(false);
  };

  const inviteNotifications: CollapseProps['items'] = filteredNotifications
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
      <Button className="col-10 mx-auto button-height button" onClick={() => accept(id)}>
        {t('accept')}
      </Button>
      <Button
        className="col-10 mx-auto button-height button"
        style={{ backgroundColor: '#CDD5EC', border: 'none' }}
        onClick={() => decline(id)}
      >
        {t('decline')}
      </Button>
    </div>
  </>,
      };
    })
    .sort((a, b) => b.key - a.key);

  useEffect(() => {
    if (inviteNotifications.length === 1) {
      isReadHandler([inviteNotifications[0].key as string]);
    }
  }, []);

  useEffect(() => {
    if (!inviteNotifications.length) {
      modalClose();
    }
  }, [inviteNotifications.length]);

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
          defaultActiveKey={inviteNotifications.length === 1 ? inviteNotifications[0].key as string : undefined}
          expandIcon={({ isActive }) => <CaretRightOutlined className="d-flex align-items-center" rotate={isActive ? 90 : 0} />}
          items={inviteNotifications}
        />
      </div>
    </Modal>
  );
};

export default ModalInviteNotifications;
