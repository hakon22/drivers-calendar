/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Modal, Result, Button, Form, Progress, Spin, DatePicker,
} from 'antd';
import type { DatePickerProps } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import {
  useContext, useState, useEffect, useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { fetchConfirmCode } from '@/slices/userSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import VerificationInput from 'react-verification-input';
import locale from '@/locales/pickers.locale.RU';
import {
  ApiContext, ModalContext, NavbarContext, SubmitContext,
} from '@/components/Context';
import type { ModalShowType } from '@/types/Modal';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import { LoginButton } from '@/pages/welcome';
import toast from '@/utilities/toast';
import routes from '@/routes';
import axios from 'axios';
import SortableItem from './SortableItem';
import { UserModel } from '../../server/db/tables/Users';
import { loginValidation } from '@/validations/validations';
import MaskedInput from './forms/MaskedInput';

const ModalSignup = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.signup' });
  const router = useRouter();
  const { modalClose } = useContext(ModalContext);

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={() => {
        modalClose();
        router.push(routes.loginPage);
      }}
    >
      <Result
        status="success"
        title={t('title')}
        subTitle={t('subTitle')}
        extra={(
          <div className="col-9 d-flex mx-auto">
            <LoginButton title={t('loginButton')} className="button button-height w-100" onClick={modalClose} />
          </div>
        )}
      />
    </Modal>
  );
};

const ModalRecovery = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.recovery' });
  const router = useRouter();
  const { modalClose } = useContext(ModalContext);

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={() => {
        modalClose();
        router.push(routes.loginPage);
      }}
    >
      <Result
        status="success"
        title={t('title')}
        subTitle={t('subTitle')}
        extra={(
          <div className="col-9 d-flex mx-auto">
            <LoginButton title={t('loginButton')} className="button button-height w-100" onClick={modalClose} />
          </div>
        )}
      />
    </Modal>
  );
};

const ModalMakeSchedule = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.makeSchedule' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { setIsActive } = useContext(NavbarContext);
  const { makeSchedule } = useContext(ApiContext);

  const { token } = useAppSelector((state) => state.user);
  const { users } = useAppSelector((state) => state.crew);

  const [sortableUsers, setSortableUsers] = useState(users);
  const [activeId, setActiveId] = useState(0);
  const [page, setPage] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over?.id && active.id !== over.id) {
      setSortableUsers((items) => {
        const oldIndex = items.indexOf(items.find((item) => item.id === active.id) as UserModel);
        const newIndex = items.indexOf(items.find((item) => item.id === over.id) as UserModel);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(+active.id);
  };

  const onFinish: DatePickerProps<Dayjs[]>['onChange'] = async (date, startDate) => {
    try {
      if (!Array.isArray(startDate)) {
        setIsSubmit(true);
        const { data } = await axios.post(routes.makeSchedule, { startDate, users: sortableUsers }, {
          headers: { Authorization: `Bearer ${token}` },
        }) as { data: { code: number } };
        if (data.code === 1) {
          makeSchedule(data);
          modalClose();
          setIsActive(false);
          setIsSubmit(false);
        } else {
          toast(tToast('crewNotExists'), 'error');
          setIsSubmit(false);
        }
      }
    } catch (e) {
      axiosErrorHandler(e, tToast);
    }
  };

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-3">
        {!page ? (
          <>
            <div className="h1">{t('selectQueue')}</div>
            <DndContext
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
              modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
              <SortableContext items={sortableUsers} strategy={verticalListSortingStrategy}>
                <ul className="d-flex flex-column gap-2 ps-0 col-12">
                  {sortableUsers.map((user, index) => <SortableItem user={user} key={user.id} index={index + 1} activeId={activeId} />)}
                </ul>
              </SortableContext>
            </DndContext>
            <Button className="col-4 mx-auto mt-3 button" onClick={() => setPage(1)}>
              {t('next')}
            </Button>
          </>
        ) : (
          <>
            <div className="h1" ref={ref}>{t('selectDate')}</div>
            <DatePicker
              onChange={onFinish}
              needConfirm
              open
              locale={locale}
              getPopupContainer={(defaultContainer) => {
                defaultContainer.classList.add('d-none');
                return ref?.current ? ref.current : defaultContainer;
              }}
            />
            <Button className="col-4 mx-auto mt-3 button" onClick={() => setPage(0)}>
              {t('back')}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

const ModalInviteReplacement = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.inviteReplacement' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { modalClose } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { setIsActive } = useContext(NavbarContext);
  const { makeSchedule } = useContext(ApiContext);

  const { token } = useAppSelector((state) => state.user);
  const { users } = useAppSelector((state) => state.crew);

  const onFinish = async ({ phone }: { phone: string }) => {
    if (!Array.isArray(startDate)) {
      setIsSubmit(true);
      const { data } = await axios.post(routes.makeSchedule, { startDate, users: sortableUsers }, {
        headers: { Authorization: `Bearer ${token}` },
      }) as { data: { code: number } };
      if (data.code === 1) {
        makeSchedule(data);
        modalClose();
        setIsActive(false);
        setIsSubmit(false);
      } else {
        toast(tToast('crewNotExists'), 'error');
        setIsSubmit(false);
      }
    }
  };

  return (
    <Modal
      centered
      open
      footer={null}
      onCancel={modalClose}
    >
      <div className="col-10 my-4 d-flex flex-column align-items-center gap-3">
        <Form name="recovery" onFinish={onFinish}>
          <Form.Item<{ phone: string }> name="phone" rules={[loginValidation]}>
            <MaskedInput mask="+7 (000) 000-00-00" className="button-height" prefix={<PhoneOutlined className="site-form-item-icon" />} placeholder={t('phone')} />
          </Form.Item>
          <div className="d-flex col-12">
            <Button type="primary" htmlType="submit" className="w-100 button">
              {t('submitButton')}
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

const ModalConfirmPhone = ({ setState }: { setState: (arg: boolean) => void }) => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.confirmPhone' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });
  const { t: tValidation } = useTranslation('translation', { keyPrefix: 'validation' });
  const dispatch = useAppDispatch();

  const { key, loadingStatus, phone = '' } = useAppSelector((state) => state.user);
  const { modalClose } = useContext(ModalContext);

  const [timer, setTimer] = useState<number>(59);
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onFinish = async (codeValue: string) => {
    const { payload: { code } } = await dispatch(fetchConfirmCode({ phone, key, code: codeValue })) as { payload: { code: number } };
    if (code === 2) {
      setState(true);
    }
    if (code === 3) {
      setValue('');
      setErrorMessage(tValidation('incorrectCode'));
    }
    if (code === 4) {
      setValue('');
      setErrorMessage(tValidation('timeNotOver'));
    }
  };

  const repeatSMS = async () => {
    const { payload: { code } } = await dispatch(fetchConfirmCode({ phone })) as { payload: { code: number } };
    if (code === 1) {
      setValue('');
      setErrorMessage('');
      setTimer(59);
      toast(tToast('sendSmsSuccess'), 'success');
    } else {
      modalClose();
      toast(tToast('sendSmsError'), 'error');
    }
  };

  useEffect(() => {
    if (timer) {
      const timerAlive = setTimeout(setTimer, 1000, timer - 1);
      return () => clearTimeout(timerAlive);
    }
    return undefined;
  }, [timer]);

  return (
    <Modal centered open footer={null} onCancel={modalClose} className="reduced-padding">
      <Spin tip={t('loading')} spinning={loadingStatus !== 'finish'} fullscreen size="large" />
      <Form name="confirmPhone" onFinish={onFinish} className="d-flex flex-column align-items-center my-4">
        <span className="mb-3 h1 text-center">{t('h1')}</span>
        <span className="mb-3-5 text-center">{t('enterTheCode')}</span>
        <div className="d-flex justify-content-center mb-5 col-10 position-relative">
          <VerificationInput
            validChars="0-9"
            value={value}
            inputProps={{ inputMode: 'numeric' }}
            length={4}
            placeholder="X"
            classNames={{
              container: 'd-flex gap-3',
              character: 'verification-character',
            }}
            autoFocus
            onComplete={onFinish}
            onChange={setValue}
          />
          {errorMessage && <div className="error-message anim-show">{errorMessage}</div>}
        </div>
        <p className="text-muted">{t('didntReceive')}</p>
        {timer ? (
          <div>
            <span className="text-muted">{t('timerCode', { count: timer })}</span>
            <Progress showInfo={false} />
          </div>
        ) : <Button className="border-0 text-muted" style={{ boxShadow: 'unset' }} onClick={repeatSMS}>{t('sendAgain')}</Button>}
      </Form>
    </Modal>
  );
};

const Modals = () => {
  const { show } = useContext(ModalContext);
  const setState = typeof show === 'object' ? show.modalSetState : undefined;

  const modals: { [K in ModalShowType]: JSX.Element | null } = {
    none: null,
    signup: <ModalSignup />,
    recovery: <ModalRecovery />,
    makeSchedule: <ModalMakeSchedule />,
    inviteReplacement: <ModalInviteReplacement />,
    activation: setState ? <ModalConfirmPhone setState={setState} /> : null,
  };

  return typeof show === 'object' ? modals[show.show] : modals[show];
};

export default Modals;
