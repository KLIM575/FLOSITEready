import React, { Suspense, lazy } from 'react';
import Header from './Header';
import PageViewTracker from './PageViewTracker';
import GlobalSeoHead from '../seo/GlobalSeoHead';
import CookieConsent from '../common/CookieConsent';

const Footer = lazy(() => import('./Footer'));

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <GlobalSeoHead />
      <PageViewTracker />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <CookieConsent />
    </div>
  );
};

export default Layout;
