import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Shield,
  HelpCircle,
  RotateCcw,
  ExternalLink,
  Lock,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';

export function AIAssistant({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "👋 Hi! I'm **Ravi AI**, your personal guide to Ravi Prakash's developer portfolio, cybersecurity learning notes, and project work.\n\nAsk me anything about his skills, projects, certifications, or cybersecurity journey!",
      citations: ['Public Knowledge Hub']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Who is Ravi Prakash?',
    'What cybersecurity topics has Ravi studied?',
    'What programming languages does Ravi know?',
    'What projects has Ravi built?',
    'What certifications does Ravi have?',
    'Where can I find Ravi notes?'
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (queryToSend = null) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || loading) return;

    const newMessages = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInputQuery('');
    setLoading(true);

    try {
      const history = newMessages.map((m) => ({ role: m.role, content: m.content }));
      const response = await api.askAI(query, history);

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.answer || "I don't have that information in Ravi's public knowledge base yet.",
          citations: response.citations || ['Approved Profile']
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: "I ran into a temporary issue retrieving that information. Please try again shortly.",
          citations: ['Error Fallback']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "History reset! Ask me anything about Ravi Prakash's skills, projects, notes, or cybersecurity journey.",
        citations: ['Public Knowledge Hub']
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[90vh] flex flex-col bg-[#090d16] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden animate-fadeIn">
      {/* Header Bar */}
      <div className="bg-slate-950/90 px-4 py-3.5 border-b border-slate-800 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-sm">Ask Ravi AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Grounded in Public Profile</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearHistory}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Reset Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
            title="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 space-y-2 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-inner'
              }`}
            >
              <div className="markdown-body leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.content}
                </ReactMarkdown>
              </div>

              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1 text-[9px] font-mono text-cyan-400">
                  <Shield className="w-2.5 h-2.5" />
                  <span>Source: {msg.citations.join(' • ')}</span>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5 text-purple-300">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono pl-8">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
            <span className="ml-1 text-[11px] text-slate-400">Synthesizing grounded answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-900 overflow-x-auto flex gap-1.5 scrollbar-none">
        {suggestions.map((sug, i) => (
          <button
            key={i}
            onClick={() => handleSend(sug)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-[10px] text-slate-300 hover:text-cyan-300 transition-colors"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about Ravi's cybersecurity, notes, skills..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white disabled:opacity-40 transition-all cursor-pointer shadow-glow-cyan"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="text-[9px] text-slate-400 font-mono text-center pt-1.5 flex items-center justify-center gap-1">
          <Lock className="w-2.5 h-2.5 text-slate-400" />
          <span>Strict Knowledge Boundary: No fabricated facts or personal leaks.</span>
        </div>
      </div>
    </div>
  );
}
