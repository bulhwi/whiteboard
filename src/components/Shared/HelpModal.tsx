import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">RL8P 실시간 낙서판 사용법</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="text-gray-500 text-xl">✕</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* 기본 사용법 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🖊️ 기본 사용법
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>펜 도구:</strong> 마우스나 터치로 자유롭게 그리기</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>색상 선택:</strong> 검정, 빨강, 파랑 중 선택</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>굵기 조절:</strong> 얇게/굵게 선택</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>지우개:</strong> 그린 선을 지우기</span>
              </li>
            </ul>
          </section>

          {/* 단축키 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              ⌨️ 단축키
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-700">캔버스 전체 지우기</span>
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">R</kbd>
              </div>
            </div>
          </section>

          {/* 실시간 협업 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              👥 실시간 협업
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>최대 10명까지 동시 접속 가능</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>다른 사용자의 커서와 그림이 실시간으로 표시</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>각 사용자는 고유한 색상과 닉네임을 가짐</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>채팅창으로 간단한 텍스트 소통 가능</span>
              </li>
            </ul>
          </section>

          {/* 주의사항 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              ⚠️ 주의사항
            </h3>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <ul className="space-y-1 text-sm text-amber-800">
                <li>• 개인정보나 민감한 내용을 입력하지 마세요</li>
                <li>• 누구나 접속 가능한 공개 화이트보드입니다</li>
                <li>• 악성 콘텐츠 발견 시 새로고침으로 초기화하세요</li>
                <li>• 작업 내용은 영구 저장되지 않습니다</li>
              </ul>
            </div>
          </section>

          {/* 문제 해결 */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🔧 문제 해결
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>동기화 안됨:</strong> 인터넷 연결을 확인하고 새로고침</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>접속 제한:</strong> 10명 초과 시 잠시 후 재시도</span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span><strong>오류 발생:</strong> 브라우저 새로고침(F5)</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;