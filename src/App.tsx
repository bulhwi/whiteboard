import React from 'react';
import { WhiteboardProvider } from './context/WhiteboardContext';
import Canvas from './components/Canvas/Canvas';
import DrawingTools from './components/DrawingTools/DrawingTools';
import Presence from './components/Presence/Presence';
import UserLimitModal from './components/Shared/UserLimitModal';
import SecurityBanner from './components/Shared/SecurityBanner';
import ConnectionStatus from './components/Shared/ConnectionStatus';
import ErrorBoundary from './components/Shared/ErrorBoundary';
import HelpModal from './components/Shared/HelpModal';
import PerformanceDashboard from './components/Shared/PerformanceDashboard';
import RealtimeStatus from './components/Shared/RealtimeStatus';
import Chat from './components/Chat/Chat';
import { usePresence } from './hooks/usePresence';
import { useKeyboard } from './hooks/useKeyboard';
import { useChat } from './hooks/useChat';

const AppContent = () => {
  const { showBlockModal, closeBlockModal } = usePresence();
  const { messages, sendMessage } = useChat();
  const [showHelp, setShowHelp] = React.useState(false);
  useKeyboard(); // 키보드 이벤트 리스너 등록

  return (
    <>
      <div className="min-h-screen bg-canvas-bg flex flex-col">
        <header className="p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">RL8P 실시간 낙서판</h1>
            <div className="flex items-center gap-3">
              <Presence />
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="도움말"
              >
                <span className="text-lg">❓</span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4">
          <ConnectionStatus />
          <SecurityBanner />
          
          <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 h-full">
            {/* Left Sidebar - Drawing Tools */}
            <aside className="xl:flex-shrink-0 order-2 xl:order-1">
              <DrawingTools />
            </aside>
            
            {/* Center - Canvas */}
            <div className="flex-1 flex justify-center items-center order-1 xl:order-2 min-h-[60vh] xl:min-h-full">
              <Canvas />
            </div>

            {/* Right Sidebar - Chat */}
            <aside className="xl:flex-shrink-0 xl:w-80 order-3">
              <div className="sticky top-4">
                <Chat 
                  messages={messages} 
                  onSendMessage={sendMessage}
                />
              </div>
            </aside>
          </div>
        </main>
        
        <footer className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-500 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <p>💡 공개 URL이므로 민감한 정보 입력을 주의하세요</p>
            <p className="text-xs text-gray-400">Press 'R' to reset canvas | 🎯 RL8P v1.0</p>
          </div>
        </footer>
      </div>
      
      {/* Modals */}
      <UserLimitModal 
        isOpen={showBlockModal} 
        onClose={closeBlockModal} 
      />
      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
      <PerformanceDashboard />
      <RealtimeStatus />
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <WhiteboardProvider>
        <AppContent />
      </WhiteboardProvider>
    </ErrorBoundary>
  );
}

export default App;