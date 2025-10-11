import { Link, NavLink } from 'react-router-dom';

import inter from '../assets/inter.svg'

export function Header() {
  const linkClass =
    'text-lg transition-opacity hover:opacity-70 border-b-2 border-transparent hover:border-red-300'
  const activeLinkClass =
    'text-lg transition-opacity hover:opacity-70 border-b-2 border-red-500'

  return (
    <header className='container mx-auto flex items-center justify-between px-4 py-8'>
      <Link to='/'>
        <img src={inter} className='img-fluid float-start' />
      </Link>

      <nav className='flex gap-6'>
        <NavLink 
          to='/' 
          className={({ isActive }) => (isActive ? activeLinkClass : linkClass)}
        >
          Jogos
        </NavLink>

        <NavLink 
          to='/resultados' 
          className={({ isActive }) => (isActive ? activeLinkClass : linkClass)}
        >
          Resultados
        </NavLink>
      </nav>
    </header>
  );
}
