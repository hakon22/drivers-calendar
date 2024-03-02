import { useContext } from 'react';
import Link from 'next/link';
import routes from '../routes';

const NavBar = () => (
  <Link className="navbar-brand" href={routes.homePage}>Ссылка</Link>
);

export default NavBar;
