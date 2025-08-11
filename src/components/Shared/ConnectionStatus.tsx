import React, { useState, useEffect } from 'react';

const ConnectionStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineBanner) return null;

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-3 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <span className="text-lg">📡</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            인터넷 연결이 끊어졌습니다
          </h3>
          <p className="text-sm text-red-700">
            실시간 동기화가 일시적으로 중단될 수 있습니다. 연결을 확인해주세요.
          </p>
        </div>
        {isOnline && (
          <button
            onClick={() => setShowOfflineBanner(false)}
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-red-100 transition-colors"
          >
            <span className="text-red-600 text-sm">✕</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;