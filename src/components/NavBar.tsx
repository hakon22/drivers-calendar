import { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cn from 'classnames';
import { Drawer, Button } from 'antd';
import { AuthContext, ModalContext, NavbarContext } from './Context';

const NavBar = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index.navbar' });

  const { logOut } = useContext(AuthContext);
  const { modalOpen } = useContext(ModalContext);
  const { isActive, setIsActive } = useContext(NavbarContext);

  const className = cn('menu-btn', { active: isActive });

  const onChangeHandler = () => setIsActive(!isActive);

  const scheduleHandler = () => modalOpen('makeSchedule');
  const inviteReplacementHandler = () => modalOpen('inviteReplacement');
  const container = useRef(null);

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
