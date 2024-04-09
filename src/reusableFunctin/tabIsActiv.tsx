import { useCallback, useEffect, useState } from 'react';

export default function useIsTabActive (){
    const [isTabVisible, setIsTabVisible] = useState(false);
    const handleVisibilityChange = useCallback(() => {
        // eslint-disable-next-line no-undef
        setIsTabVisible(document.visibilityState === 'visible');
    }, []);
  
    useEffect(() => {
        // eslint-disable-next-line no-undef
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            // eslint-disable-next-line no-undef
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
  
    return isTabVisible;
}



