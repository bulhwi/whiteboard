import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

const DebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const gatherDebugInfo = async () => {
      const info = {
        env: {
          mode: import.meta.env.MODE,
          hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
          hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          urlPreview: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...'
        },
        supabase: {
          url: import.meta.env.VITE_SUPABASE_URL,
          key: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
        },
        realtime: {
          status: 'testing...'
        }
      };

      // Test basic connection
      let connectionResult = 'success';
      try {
        await supabase.from('_test').select('*').limit(1);
      } catch (error: any) {
        connectionResult = error.message;
      }

      // Test realtime
      const testChannel = supabase.channel('debug-test');
      testChannel.subscribe((status) => {
        info.realtime.status = status;
        setDebugInfo({ ...info, connection: connectionResult });
        if (status === 'SUBSCRIBED') {
          testChannel.unsubscribe();
        }
      });

      setDebugInfo({ ...info, connection: connectionResult });
    };

    if (isVisible) {
      gatherDebugInfo();
    }
  }, [isVisible]);

  // Show debug panel only in development or when accessed via special key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setIsVisible(!isVisible);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md z-50 text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">🔧 Debug Panel</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Environment:</strong>
          <pre className="text-xs mt-1">{JSON.stringify(debugInfo.env, null, 2)}</pre>
        </div>
        
        <div>
          <strong>Connection:</strong> 
          <span className={debugInfo.connection === 'success' ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.connection || 'testing...'}
          </span>
        </div>
        
        <div>
          <strong>Realtime:</strong> 
          <span className={debugInfo.realtime?.status === 'SUBSCRIBED' ? 'text-green-400' : 'text-yellow-400'}>
            {debugInfo.realtime?.status}
          </span>
        </div>
      </div>
      
      <div className="mt-3 text-gray-400">
        Press Ctrl+Shift+D to toggle
      </div>
    </div>
  );
};

export default DebugPanel;