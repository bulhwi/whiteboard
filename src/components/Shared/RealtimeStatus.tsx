import React, { useState, useEffect } from 'react';

const RealtimeStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'mock' | 'real' | 'localStorage' | 'unknown'>('unknown');

  useEffect(() => {
    setConnectionMode('real');
    setIsConnected(true);
  }, []);

  if (connectionMode === 'mock') {
    return (
      <div className="fixed top-20 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2 shadow-sm z-30">
        <div className="flex items-center gap-2 text-sm text-yellow-700">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span>목업 모드 (로컬 전용)</span>
        </div>
      </div>
    );
  }

  if (connectionMode === 'localStorage') {
    return (
      <div className="fixed top-20 right-4 bg-blue-50 border border-blue-200 rounded-lg p-2 shadow-sm z-30">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span>브라우저 간 동기화</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 bg-green-50 border border-green-200 rounded-lg p-2 shadow-sm z-30">
      <div className="flex items-center gap-2 text-sm text-green-700">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
        <span>실시간 연결 {isConnected ? '활성' : '비활성'}</span>
      </div>
    </div>
  );
};

export default RealtimeStatus;