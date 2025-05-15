import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';

const Layout = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen w-screen w-full flex flex-col">

      <Navigation currentPath={location.pathname} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
