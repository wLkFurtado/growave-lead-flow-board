import { useEffect, useState, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useClientContext } from '@/contexts/ClientContext';

/**
 * Hook para monitorar visibilidade da página com debounce
 */
export const usePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(!document.hidden);
  const queryClient = useQueryClient();
  const { activeClient } = useClientContext();
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounce para evitar spam de invalidações
  const debouncedInvalidate = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (activeClient) {
        queryClient.invalidateQueries({
          queryKey: ['facebook-ads', activeClient]
        });
        queryClient.invalidateQueries({
          queryKey: ['whatsapp-leads', activeClient]
        });
      }
    }, 300); // 300ms debounce
  }, [queryClient, activeClient]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden;
      setIsVisible(visible);
      
      if (visible) {
        debouncedInvalidate();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedInvalidate]);

  return isVisible;
};