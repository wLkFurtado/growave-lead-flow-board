import { useEffect, useState } from 'react';

/**
 * Hook para monitorar visibilidade da página
 * Útil para debug de problemas de refetch ao trocar abas
 */
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      // Log para debug
      console.log('👁️ Visibilidade da página mudou:', {
        visible,
        timestamp: new Date().toLocaleTimeString()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};