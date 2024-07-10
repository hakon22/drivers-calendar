import { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { Drawer, Button } from 'antd';
import { useAppSelector } from '@/utilities/hooks';
import { AuthContext, ModalContext, NavbarContext } from './Context';
import ReservedDaysTypeEnum from '../../server/types/user/enum/ReservedDaysTypeEnum';

const NavBar = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index.navbar' });

  const { id } = useAppSelector((state) => state.user);
  const { reservedDays } = useAppSelector((state) => state.crew);

  const { logOut } = useContext(AuthContext);
  const { modalOpen } = useContext(ModalContext);
  const { isActive, closeNavbar, setIsActive } = useContext(NavbarContext);

  const className = cn('menu-btn', { active: isActive });

  const onChangeHandler = () => setIsActive(!isActive);

  const scheduleHandler = () => modalOpen('makeSchedule');
  const inviteReplacementHandler = () => modalOpen('inviteReplacement');
  const carsSettingsHandler = () => modalOpen('carsControl');
  const swapShiftsHandler = () => modalOpen('swapShifts');
  const takeSickLeaveHandler = () => modalOpen('takeSickLeave');
  const takeVacationHandler = () => modalOpen('takeVacation');
  const cancelSickLeaveHandler = () => modalOpen('cancelSickLeave');
  const cancelVacationHandler = () => modalOpen('cancelVacation');

  const container = useRef(null);

  const userReservedDays = reservedDays.find((reservedDay) => reservedDay.userId === id);

  return (
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
          <Button className="w-100 button button-height" onClick={scheduleHandler}>
            {t('buttons.makeSchedule')}
          </Button>
          <Button className="w-100 button button-height" onClick={inviteReplacementHandler}>
            {t('buttons.inviteReplacement')}
          </Button>
          <Button className="w-100 button button-height" onClick={carsSettingsHandler}>
            {t('buttons.car')}
          </Button>
          <Button className="w-100 button button-height" onClick={swapShiftsHandler}>
            {t('buttons.swapShifts')}
          </Button>
          <Button className="w-100 button button-height" disabled={userReservedDays?.type === ReservedDaysTypeEnum.VACATION} onClick={userReservedDays?.type === ReservedDaysTypeEnum.HOSPITAL ? cancelSickLeaveHandler : takeSickLeaveHandler}>
            {userReservedDays?.type === ReservedDaysTypeEnum.HOSPITAL ? t('buttons.cancelSickLeave') : t('buttons.takeSickLeave')}
          </Button>
          <Button className="w-100 button button-height" disabled={userReservedDays?.type === ReservedDaysTypeEnum.HOSPITAL} onClick={userReservedDays?.type === ReservedDaysTypeEnum.VACATION ? cancelVacationHandler : takeVacationHandler}>
            {userReservedDays?.type === ReservedDaysTypeEnum.VACATION ? t('buttons.cancelVacation') : t('buttons.takeVacation')}
          </Button>
          <Button
            className="w-100 button button-height"
            onClick={() => {
              logOut();
              closeNavbar();
            }}
          >
            {t('buttons.exit')}
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default NavBar;
