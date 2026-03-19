'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import CodeEditor from './components/CodeEditor';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeMode, setActiveMode] = useState('chat');
  const [showEditor, setShowEditor] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortControllerRef = useRef(null);

  // Load conversations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('programmer-assistant-conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      }
    } catch (e) {
      console.error('Error loading conversations:', e);
    }
  }, []);

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem('programmer-assistant-conversations', JSON.stringify(conversations));
      } catch (e) {
        console.error('Error saving conversations:', e);
      }
    }
  }, [conversations]);

  // Load messages when switching conversations
  useEffect(() => {
    if (activeConversation) {
      const conv = conversations.find((c) => c.id === activeConversation);
      if (conv) {
        setMessages(conv.messages || []);
        setActiveMode(conv.mode || 'chat');
      }
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const updateConversation = useCallback((convId, updates) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, ...updates } : c))
    );
  }, []);

  const handleNewChat = useCallback(() => {
    const newConv = {
      id: generateId(),
      title: '',
      mode: activeMode,
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversation(newConv.id);
    setMessages([]);
    setInputValue('');
    setStreamingContent('');
    setSidebarOpen(false);
  }, [activeMode]);

  const handleDeleteConversation = useCallback((convId) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConversation === convId) {
      setActiveConversation(null);
      setMessages([]);
    }
  }, [activeConversation]);

  const handleModeChange = useCallback((mode) => {
    setActiveMode(mode);
    if (activeConversation) {
      updateConversation(activeConversation, { mode });
    }
  }, [activeConversation, updateConversation]);

  const sendMessage = useCallback(async (content, mode) => {
    if (!content.trim() || isLoading) return;

    let convId = activeConversation;

    // Create new conversation if none active
    if (!convId) {
      const newConv = {
        id: generateId(),
        title: content.slice(0, 50),
        mode: mode || activeMode,
        messages: [],
        createdAt: Date.now(),
      };
      setConversations((prev) => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversation(convId);
    }

    const userMessage = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setStreamingContent('');

    // Update conversation title from first message
    const conv = conversations.find((c) => c.id === convId);
    if (!conv?.title || conv.title === '') {
      updateConversation(convId, { title: content.slice(0, 50), messages: newMessages });
    } else {
      updateConversation(convId, { messages: newMessages });
    }

    try {
      abortControllerRef.current = new AbortController();

      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          mode: mode || activeMode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              assistantContent += parsed.content;
              setStreamingContent(assistantContent);
            }
          } catch (e) {
            // skip
          }
        }
      }

      const assistantMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: Date.now(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      updateConversation(convId, { messages: finalMessages });
    } catch (error) {
      if (error.name !== 'AbortError') {
        const errorMessage = {
          role: 'assistant',
          content: `⚠️ حدث خطأ: ${error.message}\n\nتأكد من:\n1. إضافة مفتاح DeepSeek API في ملف \`.env.local\`\n2. أن المفتاح صحيح وفعال\n3. أن لديك اتصال بالإنترنت`,
          timestamp: Date.now(),
        };
        const finalMessages = [...newMessages, errorMessage];
        setMessages(finalMessages);
        updateConversation(convId, { messages: finalMessages });
      }
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  }, [activeConversation, messages, isLoading, activeMode, conversations, updateConversation]);

  const handleSend = useCallback(() => {
    sendMessage(inputValue, activeMode);
  }, [inputValue, activeMode, sendMessage]);

  const handleSendCode = useCallback((code, language) => {
    const modePrompts = {
      generate: `أريد توليد كود ${language}. هذا الكود الحالي كمرجع:\n\`\`\`${language}\n${code}\n\`\`\``,
      debug: `هذا الكود يحتوي على خطأ. ساعدني في إيجاد وحل المشكلة:\n\`\`\`${language}\n${code}\n\`\`\``,
      explain: `اشرح لي هذا الكود بالتفصيل:\n\`\`\`${language}\n${code}\n\`\`\``,
      optimize: `حسّن هذا الكود واجعله أكثر كفاءة:\n\`\`\`${language}\n${code}\n\`\`\``,
      chat: `تحقق من هذا الكود:\n\`\`\`${language}\n${code}\n\`\`\``,
    };

    sendMessage(modePrompts[activeMode] || modePrompts.chat, activeMode);
  }, [activeMode, sendMessage]);

  const handleFeatureClick = useCallback((featureId) => {
    setActiveMode(featureId);
    setShowEditor(true);
  }, []);

  const modeLabels = {
    generate: '⚡ توليد كود',
    debug: '🔧 حل الأخطاء',
    explain: '📖 شرح الكود',
    optimize: '🚀 تحسين الكود',
    chat: '💬 محادثة حرة',
  };

  return (
    <div className="app-container">
      {/* Mobile sidebar toggle */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onNewChat={handleNewChat}
        onSelectConversation={setActiveConversation}
        onDeleteConversation={handleDeleteConversation}
        activeMode={activeMode}
        onModeChange={handleModeChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main-content">
        <div className="top-bar">
          <div className="top-bar-right">
            <span className="top-bar-title">
              {activeConversation
                ? conversations.find((c) => c.id === activeConversation)?.title || 'محادثة جديدة'
                : 'مساعد المبرمج'}
            </span>
            <span className="top-bar-mode">{modeLabels[activeMode] || modeLabels.chat}</span>
          </div>
          <div className="top-bar-left">
            <button
              className="top-bar-btn"
              onClick={() => setShowEditor(!showEditor)}
            >
              {showEditor ? '✕ إغلاق المحرر' : '📝 فتح المحرر'}
            </button>
          </div>
        </div>

        <div className={`content-area ${showEditor ? 'with-editor' : ''}`}>
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            streamingContent={streamingContent}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSend}
            activeMode={activeMode}
            onFeatureClick={handleFeatureClick}
          />

          {showEditor && (
            <CodeEditor
              onSendCode={handleSendCode}
              activeMode={activeMode}
            />
          )}
        </div>
      </main>
    </div>
  );
}
