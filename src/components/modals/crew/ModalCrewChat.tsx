/* eslint-disable @typescript-eslint/no-shadow */
import {
  Modal, Input, Button, Space, Spin,
} from 'antd';
import { debounce } from 'lodash';
import { SendOutlined } from '@ant-design/icons';
import {
  ChangeEvent, useContext, useState, useRef,
  useEffect,
} from 'react';
import { useAppSelector, useAppDispatch } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext, SubmitContext } from '@/components/Context';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import routes from '@/routes';
import axios from 'axios';
import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import isToday from 'dayjs/plugin/isToday';
import updateLocale from 'dayjs/plugin/updateLocale';
import { readChatMessages, fetchChatMessages } from '@/slices/crewSlice';
import groupObjectsByDate from '@/utilities/groupByDate';
import { ChatMessagesModel } from '../../../../server/db/tables/ChatMessages';

dayjs.extend(calendar);
dayjs.extend(isToday);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  calendar: {
    sameDay: '[Сегодня]',
    lastDay: '[Вчера]',
    nextWeek: 'DD.MM.YYYY',
    lastWeek: 'DD.MM.YYYY',
    sameElse: 'DD.MM.YYYY',
  },
});

const findNthElementWithClass = (className: string, n: number) => {
  const elements = document.getElementsByClassName(className);
  if (elements.length >= n) {
    return elements[n - 1];
  }
  return null;
};

const ModalCrewChat = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.chat' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const dispatch = useAppDispatch();

  const { id: crewId, chat, pagination } = useAppSelector((state) => state.crew);
  const { id: authorId } = useAppSelector((state) => state.user);

  const [message, setMessage] = useState('');
  const [isFetch, setIsFetch] = useState(false);

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);

  const groupedChat = Object.entries(groupObjectsByDate(chat)).sort();

  const unreadChatMessages = chat.filter((message) => !message.readBy.includes(authorId as number));

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const debouncedFetchChatMessages = debounce((offset: number) => {
    setIsFetch(true);
    dispatch(fetchChatMessages(offset));
    setTimeout(() => setIsFetch(false), 1000);
  }, 500);

  const fetchMessages = () => {
    if (chatRef.current?.scrollTop === 0 && pagination.current >= 100 && (pagination.total !== pagination.current || !pagination.total)) {
      debouncedFetchChatMessages(pagination.offset);
    }
  };

  const onFinish = async () => {
    try {
      setIsSubmit(true);
      await axios.post(routes.sendMessageToChat, { crewId, authorId, message });
      setMessage('');
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const onRead = async () => {
    try {
      const { data } = await axios.get(routes.readChatMessages) as { data: { code: number, message: ChatMessagesModel } };
      if (data.code === 1) {
        dispatch(readChatMessages({ userId: authorId as number }));
      }
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value);

  useEffect(() => {
    if (chatRef?.current && !isFetch) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    } else if (isFetch) {
      const lastOldElement = findNthElementWithClass('chat-message', pagination.count);
      if (lastOldElement) {
        lastOldElement.scrollIntoView(true);
      }
    }
    if (inputRef?.current) {
      inputRef.current.focus();
    }
    if (unreadChatMessages.length) {
      onRead();
    }

    chatRef.current?.addEventListener('scroll', fetchMessages);

    return () => {
      chatRef.current?.removeEventListener('scroll', fetchMessages);
    };
  }, [chat.length, pagination.total, pagination.current]);

  return (
    <Modal
      centered
      open
      footer={null}
      styles={{
        content: {
          paddingLeft: '0.25em', paddingRight: '0.25em', maxHeight: '95vh', overflow: 'hidden', backgroundColor: '#f8f9fb',
        },
      }}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-3">
        <div className="h1">{t('title')}</div>
        <div className="mt-2 d-flex flex-column align-items-start justify-content-center" style={{ width: '90%' }}>
          <div ref={chatRef} style={{ maxHeight: '70vh', overflow: 'auto' }} className="mb-4 d-flex flex-column gap-1 col-12">
            {isFetch && <div className="text-center p-4"><Spin /></div>}
            {groupedChat.map(([key, chat]) => (
              <div key={key} className={dayjs(key).isToday() ? '' : 'd-flex flex-column-reverse'}>
                <div className="text-center text-muted my-2">{dayjs(key).calendar()}</div>
                <div className="d-flex flex-column gap-2">
                  {chat.sort((a, b) => a.id - b.id).map(({
                    id, createdAt, author, message,
                  }) => (
                    <div key={id} className="position-relative d-flex flex-column chat-message" style={{ backgroundColor: author?.id === authorId ? '' : 'white' }}>
                      <span className="fw-bold mb-1">{author?.username}</span>
                      <span>{message}</span>
                      <span className="position-absolute text-muted" style={{ bottom: 0, right: '0.5em' }}>{dayjs(createdAt).format('HH:mm')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Space.Compact style={{ width: '100%' }}>
            <Input.TextArea
              ref={inputRef}
              autoSize
              placeholder={t('placeholder')}
              style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 'none' }}
              onChange={onChange}
              value={message}
              /* onKeyDown={({ key }) => {
                if (key === 'Enter') {
                  onFinish();
                }
              }} */
            />
            <Button
              className="d-flex justify-content-center align-items-center"
              style={{ paddingTop: '5px' }}
              onClick={onFinish}
              disabled={!message}
            >
              <SendOutlined />
            </Button>
          </Space.Compact>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCrewChat;
