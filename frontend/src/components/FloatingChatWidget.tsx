'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: number;
  role: 'bot' | 'user';
  text: string;
  isLoading?: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

const QUICK_ACTIONS = [
  "What's your experience?",
  "Tell me about your skills",
  "What products have you built?",
];

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'bot',
      text: "Hi! I'm an AI assistant powered by Ricky's resume. Ask me anything about his experience, skills, products, or career. I can only answer questions related to Ricky's professional profile.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const msgIdRef = useRef(2);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: msgIdRef.current++,
      role: 'user',
      text: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsSending(true);

    // Add loading indicator
    const loadingId = msgIdRef.current++;
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: 'bot', text: '', isLoading: true },
    ]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await response.json();
      const reply = data.reply || data.error || 'Sorry, I could not process your request.';

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({ id: msgIdRef.current++, role: 'bot', text: reply })
      );
    } catch {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== loadingId)
          .concat({
            id: msgIdRef.current++,
            role: 'bot',
            text: "I'm having trouble connecting to the backend. Please make sure the RAG server is running (npm run dev:server).",
          })
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-widget-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="chat-widget-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'var(--gradient-dawn)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Sparkles size={18} color="#fff" />
                  </div>
                  <div>
                    <h4>RAG Portfolio Assistant</h4>
                    <p>Powered by Gemini + Resume</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4,
                  }}
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="chat-widget-body" ref={bodyRef}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`chat-message ${msg.role === 'bot' ? 'chat-message-bot' : 'chat-message-user'}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Loader2 size={14} className="animate-spin" />
                      <span style={{ fontSize: 13, opacity: 0.7 }}>Thinking...</span>
                    </div>
                  ) : (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="chat-widget-footer">
              <form className="chat-widget-input" onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Ask about Ricky's resume..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isSending}
                />
                <button type="submit" aria-label="Send message" disabled={isSending}>
                  <Send size={16} />
                </button>
              </form>
              <div className="chat-quick-actions">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action}
                    className="chat-quick-btn"
                    onClick={() => sendMessage(action)}
                    disabled={isSending}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="chat-widget-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle chat"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </>
  );
}
