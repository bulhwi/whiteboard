import React, { useState } from 'react';

const SecurityBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 sm:p-4 mb-4 relative">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-lg">⚠️</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800 mb-1">
            공개 화이트보드 사용 시 주의사항
          </h3>
          <div className="text-sm text-amber-700 space-y-1">
            <p>• 개인정보나 민감한 정보를 입력하지 마세요</p>
            <p>• 누구나 접속 가능하므로 적절한 내용만 공유해주세요</p>
            <p>• 악성 콘텐츠 발견 시 새로고침하여 초기화하세요</p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-amber-100 transition-colors"
          title="배너 닫기"
        >
          <span className="text-amber-600 text-sm">✕</span>
        </button>
      </div>
    </div>
  );
};

export default SecurityBanner;