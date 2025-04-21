import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import pageTitles from '../services/utils/pageTitles';

const DocumentTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const title = pageTitles[location.pathname] || 'Workify';
    document.title = title;
  }, [location.pathname]);

  return null; 
};

export default DocumentTitleUpdater;
