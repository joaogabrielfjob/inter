import { createBrowserRouter } from 'react-router-dom';
import { Matches } from './pages/Matches';
import { Results } from './pages/Results';
import { Statistics } from './pages/Statistics';
import { Layout } from './components/Layout';

export const routes = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { 
        path: '/',
        element: <Matches />
      },
      { 
        path: '/resultados',
        element: <Results />
      },
      {
        path: '/estatisticas',
        element: <Statistics />
      },
      { 
        path: '*',
        element: <Matches />
      },
    ],
  },
]);
