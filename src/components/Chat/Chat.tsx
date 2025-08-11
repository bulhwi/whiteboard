import React, { useState, useRef, useEffect } from 'react';
import { usePresence } from '../../hooks/usePresence';
import Button from '../Shared/Button';
import type { ChatMessage } from '../../types/whiteboard';

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage }) => {
  const [messageInput, setMessageInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = usePresence();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (trimmedMessage && currentUser) {
      onSendMessage(trimmedMessage);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`bg-white border border-gray-300 rounded-lg shadow-md transition-all duration-300 ${
      isExpanded ? 'h-96' : 'h-12'
    }`}>
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">💬 채팅</span>
          {messages.length > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {messages.length}
            </span>
          )}
        </div>
        <span className="text-gray-400 text-xs">
          {isExpanded ? '▼' : '▲'}
        </span>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto h-64">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                아직 메시지가 없습니다.<br />
                첫 메시지를 보내보세요! 👋
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    <div className="flex items-start gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 border border-white shadow-sm"
                        style={{ backgroundColor: message.userColor }}
                        title={message.userName}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {message.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700 break-words">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={200}
              />
              <Button
                onClick={handleSendMessage}
                variant="primary"
                size="sm"
                disabled={!messageInput.trim() || !currentUser}
              >
                전송
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;