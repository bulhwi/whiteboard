import React from 'react';

interface UserLimitModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const UserLimitModal: React.FC<UserLimitModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          보드가 가득 찼습니다
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          현재 최대 인원(10명)이 접속 중입니다.<br />
          잠시 후 다시 시도해 주세요.
        </p>
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserLimitModal;