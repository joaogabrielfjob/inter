import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className='z-[1] flex flex-grow flex-col'>
      <Header />
      <Outlet />
    </div>
  );
};
