import { useState, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import {
  Drawer, Button, DatePicker, type DatePickerProps,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import Link from 'next/link';
import { fetchMakeSchedule } from '@/slices/crewSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { SubmitContext, AuthContext, ModalContext } from './Context';
import routes from '../routes';

const NavBar = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index.navbar' });
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);

  const [isActive, setIsActive] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const className = cn('menu-btn', { active: isActive });

  const { setIsSubmit } = useContext(SubmitContext);
  const { logOut } = useContext(AuthContext);
  const { modalOpen } = useContext(ModalContext);

  const onChangeHandler = () => setIsActive(!isActive);
  const onChangePickerHandler = () => modalOpen('makeSchedule');
  const makeSchedule = (startDate: Dayjs) => {
    setIsSubmit(true);
    dispatch(fetchMakeSchedule({ token, startDate }));
    setIsSubmit(false);
  };
  const container = useRef(null);

  return (
  // <Link className="navbar-brand" href={routes.homePage}>Ссылка</Link>
    <div ref={container}>
      <div className={className} onClick={onChangeHandler} tabIndex={0} role="button" aria-label={t('menu')} onKeyDown={() => undefined}>
        <span />
        <span />
        <span />
      </div>
      <Drawer
        title={<div className="h1">{t('menu')}</div>}
        getContainer={container?.current || false}
        closeIcon={null}
        width="100%"
        open={isActive}
      >
        <div className="d-flex flex-column gap-3">
          <Button className="w-100 button button-height" onClick={onChangePickerHandler}>
            {t('buttons.makeSchedule')}
          </Button>
          <Button className="w-100 button button-height">
            {t('buttons.inviteReplacement')}
          </Button>
          <Button className="w-100 button button-height">
            {t('buttons.addCar')}
          </Button>
          <Button className="w-100 button button-height" onClick={logOut}>
            {t('buttons.exit')}
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default NavBar;
