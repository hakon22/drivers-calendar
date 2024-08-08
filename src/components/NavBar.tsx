import { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { Drawer, Button, Popconfirm } from 'antd';
import { Telegram } from 'react-bootstrap-icons';
import { useAppSelector } from '@/utilities/hooks';
import axios from 'axios';
import routes from '@/routes';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import {
  AuthContext, ModalContext, NavbarContext, SubmitContext,
} from './Context';
import ReservedDaysTypeEnum from '../../server/types/user/enum/ReservedDaysTypeEnum';
import RolesEnum from '../../server/types/user/enum/RolesEnum';

const NavBar = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index.navbar' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const { id, role } = useAppSelector((state) => state.user);
  const { id: crewId, reservedDays, users } = useAppSelector((state) => state.crew);

  const { logOut } = useContext(AuthContext);
  const { modalOpen } = useContext(ModalContext);
  const { setIsSubmit } = useContext(SubmitContext);
  const { isActive, closeNavbar, setIsActive } = useContext(NavbarContext);

  const fullLogout = async () => {
    try {
      setIsSubmit(true);
      await axios.get(routes.kickReplacement) as { data: { code: number } };
      closeNavbar();
      setIsSubmit(false);
    } catch (e) {
      axiosErrorHandler(e, tToast, setIsSubmit);
    }
  };

  const className = cn('menu-btn', { active: isActive });

  const onChangeHandler = () => setIsActive(!isActive);

  const scheduleHandler = () => modalOpen('makeSchedule');
  const inviteReplacementHandler = () => modalOpen('inviteReplacement');
  const kickReplacementHandler = () => modalOpen('kickReplacement');
  const carsSettingsHandler = () => modalOpen('carsControl');
  const swapShiftsHandler = () => modalOpen('swapShifts');
  const takeSickLeaveHandler = () => modalOpen('takeSickLeave');
  const takeVacationHandler = () => modalOpen('takeVacation');
  const cancelSickLeaveHandler = () => modalOpen('cancelSickLeave');
  const crewSettingsHandler = () => modalOpen('crewSettings');
  const userProfileHandler = () => modalOpen('userProfile');
  const cancelVacationHandler = () => modalOpen('cancelVacation');

  const container = useRef(null);

  const userReservedDays = reservedDays?.find((reservedDay) => reservedDay.userId === id);

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
        <div className="d-flex flex-column mb-5" style={{ gap: '0.75rem' }}>
          {crewId && (
            <>
              {role !== RolesEnum.ADMIN ? (
                <>
                  <Button className="w-100 button button-height" onClick={scheduleHandler}>
                    {t('buttons.makeSchedule')}
                  </Button>
                  <Button className="w-100 button button-height" onClick={inviteReplacementHandler}>
                    {t('buttons.inviteReplacement')}
                  </Button>
                  {users.length > 1 ? (
                    <Button className="w-100 button button-height" onClick={kickReplacementHandler}>
                      {t('buttons.kickReplacement')}
                    </Button>
                  ) : null}
                  <Button className="w-100 button button-height" onClick={swapShiftsHandler}>
                    {t('buttons.swapShifts')}
                  </Button>
                  <Button className="w-100 button button-height" disabled={userReservedDays?.type === ReservedDaysTypeEnum.VACATION} onClick={userReservedDays?.type === ReservedDaysTypeEnum.HOSPITAL ? cancelSickLeaveHandler : takeSickLeaveHandler}>
                    {userReservedDays?.type === ReservedDaysTypeEnum.HOSPITAL ? t('buttons.cancelSickLeave') : t('buttons.takeSickLeave')}
                  </Button>
                  <Button className="w-100 button button-height" disabled={userReservedDays?.type === ReservedDaysTypeEnum.HOSPITAL} onClick={userReservedDays?.type === ReservedDaysTypeEnum.VACATION ? cancelVacationHandler : takeVacationHandler}>
                    {userReservedDays?.type === ReservedDaysTypeEnum.VACATION ? t('buttons.cancelVacation') : t('buttons.takeVacation')}
                  </Button>
                </>
              ) : null}
              <Button className="w-100 button button-height" onClick={carsSettingsHandler}>
                {t('buttons.car')}
              </Button>
              <Button className="w-100 button button-height" onClick={crewSettingsHandler}>
                {t('buttons.crewSettings')}
              </Button>
            </>
          )}
          <Button className="w-100 button button-height" onClick={userProfileHandler}>
            {t('buttons.userProfile')}
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
          {crewId && role !== RolesEnum.ADMIN ? (
            <Popconfirm
              title={t('popconfirm.title')}
              description={t('popconfirm.description')}
              placement="top"
              onConfirm={fullLogout}
              okButtonProps={{ danger: true }}
              okText={t('popconfirm.ok')}
              cancelText={t('popconfirm.cancel')}
            >
              <Button className="w-100 button button-height">
                {t('buttons.leave')}
              </Button>
            </Popconfirm>
          ) : null}
          <Button type="link" className="support-button border-0 mt-2 d-flex justify-content-center align-items-center gap-2 p-1 px-2 mx-auto" href="https://t.me/hakonxak">
            <Telegram color="#72a7f2" className="fs-6" />
            <span>{t('buttons.writeToSupport')}</span>
          </Button>
        </div>
      </Drawer>
    </div>
  );
};

export default NavBar;
