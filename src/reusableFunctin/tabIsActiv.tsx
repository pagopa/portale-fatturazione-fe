import { useCallback, useEffect, useState } from 'react';

export default function useIsTabActive (){
    const [isTabVisible, setIsTabVisible] = useState(false);
    const handleVisibilityChange = useCallback(() => {
        // eslint-disable-next-line no-undef
        setIsTabVisible(document.visibilityState === 'visible');
    }, []);
    console.log(isTabVisible);
    useEffect(() => {
        if(window.location.pathname  !== '/azureLogin'){
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return () => {
                // eslint-disable-next-line no-undef
                document.removeEventListener('visibilitychange', handleVisibilityChange);
            };
        }
        // eslint-disable-next-line no-undef
     
    }, []);
  
    return isTabVisible;
}
