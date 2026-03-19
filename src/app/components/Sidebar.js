'use client';

export default function Sidebar({
  conversations,
  activeConversation,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  activeMode,
  onModeChange,
  isOpen,
  onClose,
}) {
  const modes = [
    { id: 'generate', icon: '⚡', label: 'توليد كود' },
    { id: 'debug', icon: '🔧', label: 'حل الأخطاء' },
    { id: 'explain', icon: '📖', label: 'شرح الكود' },
    { id: 'optimize', icon: '🚀', label: 'تحسين الكود' },
  ];

  const modeLabels = {
    generate: 'توليد كود',
    debug: 'حل الأخطاء',
    explain: 'شرح الكود',
    optimize: 'تحسين الكود',
    chat: 'محادثة حرة',
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">{'</>'}</div>
          <div>
            <h1>مساعد المبرمج</h1>
            <p>مدعوم بالذكاء الاصطناعي</p>
          </div>
        </div>
        <button className="new-chat-btn" onClick={onNewChat}>
          <span>+</span>
          محادثة جديدة
        </button>
      </div>

      <div className="quick-actions">
        <div className="quick-actions-title">الأوضاع السريعة</div>
        <div className="quick-actions-grid">
          {modes.map((mode) => (
            <button
              key={mode.id}
              className={`quick-action-btn ${activeMode === mode.id ? 'active' : ''}`}
              onClick={() => onModeChange(mode.id)}
            >
              <span className="icon">{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="conversations-list">
        <div className="conversations-section-title">المحادثات</div>
        {conversations.length === 0 ? (
          <div className="empty-conversations">
            <div className="empty-icon">💬</div>
            <p>لا توجد محادثات بعد<br />ابدأ محادثة جديدة!</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`conversation-item ${activeConversation === conv.id ? 'active' : ''}`}
              onClick={() => {
                onSelectConversation(conv.id);
                onClose?.();
              }}
            >
              <span className="conv-icon">
                {conv.mode ? (modes.find(m => m.id === conv.mode)?.icon || '💬') : '💬'}
              </span>
              <span className="conv-title">
                {conv.title || modeLabels[conv.mode] || 'محادثة جديدة'}
              </span>
              <button
                className="conv-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                title="حذف المحادثة"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
