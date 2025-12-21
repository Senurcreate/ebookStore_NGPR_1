import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Immediate scroll to top
    window.scrollTo(0, 0);
  }, [pathname]); // Runs every time the route (pathname) changes

  return null; // This component doesn't render anything visible
};

export default ScrollToTop;