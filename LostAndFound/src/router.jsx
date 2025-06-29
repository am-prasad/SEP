// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import Browse from './pages/Browse';
import ItemDetails from './pages/ItemDetails';
import Report from './pages/Report';
import MapPage from './pages/MapPage';
import NotFound from './pages/NotFound';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'browse', element: <Browse /> },
        { path: 'report', element: <Report /> },
        { path: 'map', element: <MapPage /> },
        { path: 'item/:id', element: <ItemDetails /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

export default router;
