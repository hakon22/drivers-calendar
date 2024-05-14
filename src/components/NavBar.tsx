import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import {
  Drawer, Button, DatePicker, type DatePickerProps,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import Link from 'next/link';
import { fetchMakeSchedule } from '@/slices/crewSlice';
import { useAppDispatch, useAppSelector } from '@/utilities/hooks';
import { SubmitContext, AuthContext } from './Context';
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

  const onChangeHandler = () => setIsActive(!isActive);
  const onChangePickerHandler = () => setIsOpen(true);
  const makeSchedule = (startDate: Dayjs) => {
    setIsSubmit(true);
    dispatch(fetchMakeSchedule({ token, startDate }));
    setIsSubmit(false);
  };

  return (
  // <Link className="navbar-brand" href={routes.homePage}>Ссылка</Link>
    <>
      <DatePicker className="position-absolute" onChange={makeSchedule} open={isOpen} />
      <div className={className} onClick={onChangeHandler} tabIndex={0} role="button" aria-label={t('menu')} onKeyDown={onChangeHandler}>
        <span />
        <span />
        <span />
      </div>
      <Drawer
        title={<div className="h1">{t('menu')}</div>}
        getContainer={false}
        closeIcon={null}
        onClose={onChangeHandler}
        width="100%"
        open={isActive}
      >
        <div className="d-flex flex-column gap-3">
          <Button className="w-100 button" onClick={onChangePickerHandler}>
            {t('buttons.makeSchedule')}
          </Button>
          <Button className="w-100 button">
            {t('buttons.inviteReplacement')}
          </Button>
          <Button className="w-100 button">
            {t('buttons.addCar')}
          </Button>
          <Button className="w-100 button" onClick={logOut}>
            {t('buttons.exit')}
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default NavBar;
