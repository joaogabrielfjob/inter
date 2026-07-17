import { useLayoutEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import inter from '../assets/inter.svg'

const navigationItems = [
  { to: '/', label: 'Jogos' },
  { to: '/resultados', label: 'Resultados' },
  { to: '/estatisticas', label: 'Estatísticas' },
];

export function Header() {
  const { pathname } = useLocation();
  const navigationRef = useRef<HTMLElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const [indicator, setIndicator] = useState<{ left: number; width: number }>();

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const activeLink = linkRefs.current.get(pathname);

    if (!navigation || !activeLink) return;

    const updateIndicator = () => {
      const navigationBounds = navigation.getBoundingClientRect();
      const activeLinkBounds = activeLink.getBoundingClientRect();

      setIndicator({
        left: activeLinkBounds.left - navigationBounds.left,
        width: activeLinkBounds.width,
      });
    };

    updateIndicator();

    const resizeObserver = new ResizeObserver(updateIndicator);
    resizeObserver.observe(navigation);

    return () => resizeObserver.disconnect();
  }, [pathname]);

  const linkClass = 'text-lg transition-opacity hover:opacity-70';

  return (
    <header className='container mx-auto flex items-center justify-between px-4 py-8'>
      <Link to='/'>
        <img src={inter} className='img-fluid float-start' />
      </Link>

      <nav ref={navigationRef} className='relative flex gap-6'>
        {navigationItems.map(({ to, label }) => (
          <NavLink
            key={to}
            ref={(link) => {
              if (link) linkRefs.current.set(to, link);
              else linkRefs.current.delete(to);
            }}
            to={to}
            className={linkClass}
          >
            {label}
          </NavLink>
        ))}
        <span
          aria-hidden='true'
          className='absolute bottom-0 h-0.5 bg-red-500 transition-[transform,width,opacity] duration-200 ease-out motion-reduce:transition-none'
          style={{
            opacity: indicator ? 1 : 0,
            transform: `translateX(${indicator?.left ?? 0}px)`,
            width: indicator?.width ?? 0,
          }}
        />
      </nav>
    </header>
  );
}
