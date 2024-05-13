import { useState } from 'react';
import cn from 'classnames';
import { Drawer, Button } from 'antd';
import Link from 'next/link';
import routes from '../routes';

const NavBar = () => {
  const [isActive, setIsActive] = useState(false);
  const className = cn('menu-btn', { active: isActive });

  const onChangeHandler = () => setIsActive(!isActive);

  return (
  // <Link className="navbar-brand" href={routes.homePage}>Ссылка</Link>
    <>
      <div className={className} onClick={onChangeHandler} tabIndex={0} role="button" aria-label="Меню" onKeyDown={onChangeHandler}>
        <span />
        <span />
        <span />
      </div>
      <Drawer
        title={<div className="h1">Меню</div>}
        getContainer={false}
        closeIcon={null}
        onClose={onChangeHandler}
        width="100%"
        open={isActive}
      >
        <div className="d-flex flex-column gap-3">
          <Button className="w-100 button">
            Составить график
          </Button>
          <Button className="w-100 button">
            Пригласить сменщика
          </Button>
          <Button className="w-100 button">
            Добавить автомобиль
          </Button>
        </div>
      </Drawer>
    </>
  );
};

export default NavBar;
