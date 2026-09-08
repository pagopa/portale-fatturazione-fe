import { useCallback, useEffect, useState } from 'react';

export default function useIsTabActive (){
  const [isTabVisible, setIsTabVisible] = useState(false);
  const handleVisibilityChange = useCallback(() => {
    setIsTabVisible(document.visibilityState === 'visible');
  }, []);

  useEffect(() => {
    if(window.location.pathname  !== '/azureLogin'){
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, []);
  
  return isTabVisible;
}
