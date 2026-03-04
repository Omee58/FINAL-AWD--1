import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const WEBHOOK_URL = 'https://asd1234567890.app.n8n.cloud/webhook/shadiseva-chatbot';

const GREETING = 'Hello! I\'m ShadiSeva Assistant. How can I help you today?';

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const greetedRef = useRef(false);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when panel opens; show greeting on first open
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      if (!greetedRef.current) {
        greetedRef.current = true;
        setMessages([{ text: GREETING, sender: 'bot' }]);
      }
    }
  }, [isOpen]);

  // Reset when user logs out
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      setMessages([]);
      greetedRef.current = false;
    }
  }, [user]);

  if (!user) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userId = user.user_id || user._id || user.id;

    setInput('');
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setLoading(true);

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId,
          role: user.role,
          sessionId: userId,
          token: localStorage.getItem('token'),
        }),
      });

      const botText = res.ok ? (await res.text()) || 'No response received.' : `Error ${res.status}: ${res.statusText}`;
      setMessages(prev => [...prev, { text: botText, sender: 'bot' }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: `Connection error: ${err.message}`, sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title="ShadiSeva Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          border: 'none',
          color: '#fff',
          fontSize: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(102,126,234,0.5)',
          cursor: 'pointer',
          zIndex: 1050,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-comments'}`} />
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '24px',
            width: '350px',
            height: '480px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1049,
            background: '#fff',
            animation: 'slideUp 0.25s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: '#fff',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-robot" style={{ fontSize: '18px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>ShadiSeva Assistant</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)} · {user.full_name}
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', padding: '4px' }}
            >
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              background: '#f8f9fa',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '80%',
                    padding: '8px 12px',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#fff',
                    color: msg.sender === 'user' ? '#fff' : '#333',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '16px 16px 16px 4px',
                    background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center',
                  }}
                >
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#999',
                        display: 'inline-block',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '10px 12px',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              gap: '8px',
              background: '#fff',
              flexShrink: 0,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="form-control form-control-sm"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              style={{ borderRadius: '20px', fontSize: '13px' }}
            />
            <button
              className="btn btn-sm"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: '#fff',
                borderRadius: '50%',
                width: '34px',
                height: '34px',
                padding: 0,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="fas fa-paper-plane" style={{ fontSize: '13px' }} />
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </>
  );
}
