import { useEffect, useState, useRef } from 'react';

/**
 * Hook otimizado para monitorar visibilidade da página
 * APENAS retorna estado de visibilidade - sem invalidações automáticas
 */
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const lastVisibilityChangeRef = useRef<number>(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      const now = Date.now();
      
      // ✅ Throttle para evitar spam de mudanças
      if (now - lastVisibilityChangeRef.current < 1000) {
        return;
      }
      
      lastVisibilityChangeRef.current = now;
      setIsVisible(visible);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};