import { createBrowserRouter } from 'react-router-dom';
import { Matches } from './pages/Matches';
import { Results } from './pages/Results';
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
        path: '*',
        element: <Matches />
      },
    ],
  },
]);
