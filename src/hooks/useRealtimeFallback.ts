import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';

interface RealtimeFallbackConfig {
  onConnectionFailed: () => void;
  onConnectionRecovered: () => void;
}

export const useRealtimeFallback = (config: RealtimeFallbackConfig) => {
  const hasRealtimeFailedRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;

    const testRealtimeConnection = () => {
      console.log(`🔄 Testing Realtime connection (attempt ${retryCountRef.current + 1}/${maxRetries})`);
      
      const testChannel = supabase.channel('fallback-test');
      let connectionTimeout: NodeJS.Timeout;

      // Set a timeout for connection
      connectionTimeout = setTimeout(() => {
        console.log('❌ Realtime connection timeout');
        testChannel.unsubscribe();
        handleConnectionFailed();
      }, 5000);

      testChannel.subscribe((status) => {
        console.log('📡 Fallback test status:', status);
        
        if (status === 'SUBSCRIBED') {
          clearTimeout(connectionTimeout);
          console.log('✅ Realtime connection recovered');
          testChannel.unsubscribe();
          
          if (hasRealtimeFailedRef.current) {
            hasRealtimeFailedRef.current = false;
            retryCountRef.current = 0;
            config.onConnectionRecovered();
          }
        } else if (status === 'CHANNEL_ERROR') {
          clearTimeout(connectionTimeout);
          testChannel.unsubscribe();
          handleConnectionFailed();
        }
      });
    };

    const handleConnectionFailed = () => {
      retryCountRef.current += 1;
      
      if (!hasRealtimeFailedRef.current) {
        hasRealtimeFailedRef.current = true;
        console.log('⚠️ Realtime connection failed, activating fallback mode');
        config.onConnectionFailed();
      }

      // Retry with exponential backoff
      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        console.log(`🔄 Retrying Realtime connection in ${delay}ms`);
        
        retryTimeout = setTimeout(() => {
          testRealtimeConnection();
        }, delay);
      } else {
        console.log('❌ Max retries reached, staying in fallback mode');
      }
    };

    // Start testing after initial page load
    const initialTest = setTimeout(() => {
      testRealtimeConnection();
    }, 2000);

    return () => {
      clearTimeout(initialTest);
      clearTimeout(retryTimeout);
    };
  }, [config]);

  return {
    hasRealtimeFailed: hasRealtimeFailedRef.current
  };
};