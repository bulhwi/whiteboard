import React from 'react';
import { usePresence } from '../../hooks/usePresence';

const MAX_USERS = 10;

const Presence: React.FC = () => {
  const { users, userCount } = usePresence();
  // 진짜 멀티디바이스 동시접속자 수를 사용
  const currentUserCount = userCount > 0 ? userCount : users.length;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-white border border-gray-300 rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">
          접속자: <span className="font-semibold">{currentUserCount}/{MAX_USERS}</span>
        </span>
      </div>
      
      {users.length > 0 && (
        <div className="flex gap-1 overflow-x-auto max-w-full">
          {users.slice(0, 8).map((user) => (
            <div
              key={user.id}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: user.color }}
              title={user.nickname}
            />
          ))}
          {users.length > 8 && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white shadow-sm bg-gray-400 flex items-center justify-center flex-shrink-0">
              <span className="text-xs text-white">+{users.length - 8}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Presence;