import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';

/** Записывает просмотр страницы на бэкенд; /admin не учитывается. */
const PageViewTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const path = `${location.pathname}${location.search || ''}`;
    if (path === '/admin' || path.startsWith('/admin/')) return;
    void api.stats.recordPageView(path);
  }, [location.pathname, location.search]);

  return null;
};

export default PageViewTracker;
