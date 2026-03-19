'use client';

import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

export default function ChatInterface({
  messages,
  isLoading,
  streamingContent,
  inputValue,
  onInputChange,
  onSend,
  activeMode,
  onFeatureClick,
}) {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  };

  const modeLabels = {
    generate: 'اكتب وصف الميزة أو الفكرة وسأكتب الكود لك...',
    debug: 'ألصق الكود الذي يحتوي على خطأ وسأساعدك في حله...',
    explain: 'ألصق الكود الذي تريد شرحه وسأوضحه لك...',
    optimize: 'ألصق الكود الذي تريد تحسينه...',
    chat: 'اكتب سؤالك البرمجي هنا...',
  };

  const features = [
    { id: 'generate', icon: '⚡', title: 'توليد الكود', desc: 'صف الميزة وسأكتب الكود المناسب' },
    { id: 'debug', icon: '🔧', title: 'حل الأخطاء', desc: 'ألصق الكود وسأحل المشكلة' },
    { id: 'explain', icon: '📖', title: 'شرح الكود', desc: 'سأشرح الكود بطريقة بسيطة' },
    { id: 'optimize', icon: '🚀', title: 'تحسين الكود', desc: 'سأجعل كودك أسرع وأنظف' },
  ];

  return (
    <div className="chat-section">
      {messages.length === 0 && !isLoading ? (
        <div className="welcome-screen">
          <div className="welcome-icon">{'</>'}</div>
          <h2 className="welcome-title">مساعد المبرمج</h2>
          <p className="welcome-subtitle">
            مرحباً بك! أنا مساعدك البرمجي الذكي. يمكنني مساعدتك في كتابة الكود،
            حل الأخطاء، شرح الأكواد المعقدة، وتحسين جودة الكود.
            <br />اختر أحد الأوضاع أدناه أو ابدأ بكتابة سؤالك مباشرة.
          </p>
          <div className="welcome-features">
            {features.map((f) => (
              <div
                key={f.id}
                className="welcome-feature-card"
                onClick={() => onFeatureClick(f.id)}
              >
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {isLoading && streamingContent && (
            <MessageBubble
              message={{
                role: 'assistant',
                content: streamingContent,
                timestamp: Date.now(),
              }}
            />
          )}
          {isLoading && !streamingContent && (
            <div className="message assistant-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder={modeLabels[activeMode] || modeLabels.chat}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaInput}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="send-btn"
            onClick={onSend}
            disabled={!inputValue.trim() || isLoading}
            title="إرسال"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
