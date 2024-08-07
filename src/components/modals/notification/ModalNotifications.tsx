/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-unstable-nested-components */
import {
  Modal, Button, Collapse, Tag, type CollapseProps, Alert,
} from 'antd';
import dayjs from 'dayjs';
import { CaretRightOutlined } from '@ant-design/icons';
import { useContext, useEffect, useState } from 'react';
import cn from 'classnames';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { selectors, fetchNotificationReadUpdate, fetchNotificationRemove } from '@/slices/notificationSlice';
import { useTranslation } from 'react-i18next';
import { ModalContext, NavbarContext, SubmitContext } from '@/components/Context';
import type { Notification } from '@/types/Notification';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import axios from 'axios';
import routes from '@/routes';
import toast from '@/utilities/toast';
import NotificationEnum, { TranslateNotificationEnum } from '../../../../server/types/notification/enum/NotificationEnum';
import { ScheduleSchemaType } from '../../../../server/types/crew/ScheduleSchemaType';

const ModalNotifications = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.notifications' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const dispatch = useAppDispatch();

  const { modalClose } = useContext(ModalContext);
  const { closeNavbar } = useContext(NavbarContext);
  const { setIsSubmit } = useContext(SubmitContext);

  const notifications = useAppSelector(selectors.selectAll)
    .filter(({ type }) => type !== NotificationEnum.CHAT && type !== NotificationEnum.EXILE && type !== NotificationEnum.INVITE);

  const startObject: { [K in keyof typeof NotificationEnum]: Notification[] } = {
    SHIFT: [],
    CREW: [],
    CAR: [],
    USER: [],
    HOSPITAL: [],
    VACATION: [],
    INVITE: [],
    EXILE: [],
    CHAT: [],
  };

  const [notificationsGroup, updateNotificationsGroup] = useState(startObject);

  const back = () => {
    modalClose();
    closeNavbar();
  };

  const isReadHandler = (key: string | string[]) => {
    if (key.length) {
      const id = +key[0];
      const notification = notifications.find((notif) => notif.id === id);
      if (notification && !notification.isRead) {
        dispatch(fetchNotificationReadUpdate(id));
        updateNotificationsGroup((state) => {
          const group = state[notification.type];
          const updatedItems = group.map((notif) => {
            if (notif.id === id) {
              return { ...notif, isRead: true };
            }
            return notif;
          });
          return { ...state, [notification.type]: updatedItems };
        });
      }
    }
  };

  const decline = (id: number) => {
    const notification = notifications.find((notif) => notif.id === id);
    if (notification) {
      const notifGroup = notificationsGroup[notification.type].filter((notif) => notif.id !== notification.id);
      updateNotificationsGroup((state) => ({ ...state, [notification.type]: notifGroup }));
      dispatch(fetchNotificationRemove(id));
    }
  };

  const acceptSwapShift = async (id: number) => {
    try {
      const { data: { code } } = await axios.get(`${routes.acceptNotification}/${id}`) as { data: { code: number, notifications: Notification[], firstShift: ScheduleSchemaType, secondShift: ScheduleSchemaType } };
      if (code === 1) {
        back();
        decline(id);
        toast(tToast('swipShiftSuccess'), 'success');
      } else if (code === 2) {
        toast(tToast('notificationNotExist'), 'error');
      }
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const processingRequest = async (type: NotificationEnum, id: number) => {
    switch (type) {
      case NotificationEnum.SHIFT:
        await acceptSwapShift(id);
        break;
      default:
        break;
    }
  };

  const accept = async (id: number) => {
    try {
      setIsSubmit(true);
      const notificationType = notifications.find((notif) => notif.id === id)?.type;
      if (notificationType) {
        await processingRequest(notificationType, id);
      }
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const filteredNotifications: CollapseProps['items'] = Object.entries(notificationsGroup)
    .filter(([type]) => type !== NotificationEnum.INVITE && type !== NotificationEnum.CHAT && type !== NotificationEnum.EXILE)
    .map(([label, items], key) => {
      const preparedItems = items.map(({
        id, title, description, description2, isRead, isDecision, createdAt,
      }) => {
        const headerClass = cn('d-flex align-items-center p-2', { 'fw-bold': !isRead });
        return {
          key: id,
          label: title,
          headerClass,
          createdAt,
          style: { width: '100%' },
          children:
  <>
    <div className="d-flex flex-column align-items-start gap-3 mb-4">
      <span>{description}</span>
      <span>{description2}</span>
    </div>
    <div className="d-flex flex-column align-items-center gap-3">
      {isDecision ? (
        <Button className="col-10 mx-auto button-height button" onClick={() => accept(id)}>
          {t('accept')}
        </Button>
      ) : null}
      <Button
        className="col-10 mx-auto button-height button"
        style={{ backgroundColor: '#CDD5EC', border: 'none' }}
        onClick={() => decline(id)}
      >
        {t(isDecision ? 'decline' : 'delete')}
      </Button>
    </div>
  </>,
        };
      })
        .sort((a, b) => b.key - a.key);

      const groupUnreadCount = items.filter(({ isRead }) => !isRead).length;

      return {
        key,
        label: TranslateNotificationEnum[label as keyof typeof NotificationEnum],
        headerClass: 'd-flex align-items-center',
        extra: groupUnreadCount
          ? <Tag bordered={false} className="fw-bold text-dark rounded-pill" color="#ffcc80">{groupUnreadCount}</Tag>
          : items.length ? <Tag bordered={false} className="fw-bold text-dark rounded-pill" color="#f0f2fa">{items.length}</Tag> : null,
        style: { width: '100%', border: '1px solid gray', borderRadius: '10px' },
        children: preparedItems.length ? (
          <div className="d-flex flex-column gap-2">
            {preparedItems.map((item) => (
              <div key={item.key}>
                <div className="text-muted">{dayjs(item.createdAt).format('DD.MM (HH:mm)')}</div>
                <Collapse
                  accordion
                  style={{ backgroundColor: '#f0f2fa', width: '100%' }}
                  onChange={isReadHandler}
                  expandIcon={({ isActive }) => <CaretRightOutlined className="d-flex align-items-center" rotate={isActive ? 90 : 0} />}
                  items={[item]}
                />
              </div>
            ))}
          </div>
        ) : <Alert message={t('noNotifications')} type="success" />,
      };
    });

  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notificationsGroup[notification.type].find((notif) => notif.id === notification.id)) {
        updateNotificationsGroup((state) => ({ ...state, [notification.type]: [...state[notification.type], notification] }));
      }
    });
  }, [notifications.length]);

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
        <div className="h1">{t('title')}</div>
        <Collapse
          style={{ width: '95%', backgroundColor: 'transparent' }}
          className="d-flex flex-column align-items-center gap-2"
          accordion
          bordered={false}
          expandIcon={({ isActive }) => <CaretRightOutlined className="d-flex align-items-center" rotate={isActive ? 90 : 0} />}
          items={filteredNotifications}
        />
      </div>
    </Modal>
  );
};

export default ModalNotifications;
