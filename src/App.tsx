import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';

const StPeterLogo = () => (
  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 border border-gray-100 mt-1">
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#007A33]" fill="currentColor">
      <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z"/>
      <path d="M11 7h2v3h3v2h-3v5h-2v-5H8v-2h3V7z" fill="#fff"/>
    </svg>
  </div>
);

type Message = {
  id: string;
  text: string;
  side: 'user' | 'bot';
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your St. Peter guide. How can I help you today?',
      side: 'bot',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_REPLIES = [
    'Tell me about Plans',
    'Memorial Services',
    'Funeral Checklist',
    'Speak to an Agent'
  ];

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      side: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      
      const history = messages.map((m) => ({
        role: m.side === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
      
      history.push({ role: 'user', parts: [{ text: textToSend }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: history,
        config: {
          systemInstruction: "You are the St. Peter Digital Assistant, a helpful, compassionate, and professional guide for St. Peter Life Plans. You help users with pre-need life plans, memorial services, and funeral service checklists. Keep your answers concise, empathetic, and helpful. If a user asks something completely unrelated, gently guide them back to St. Peter services. If they ask for a human agent, tell them you are connecting them to a live representative.",
        },
      });

      const botMessage: Message = {
        id: Date.now().toString() + 'bot',
        text: response.text || "I'm sorry, I couldn't process that.",
        side: 'bot',
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + 'err',
          text: "I'm having trouble connecting right now. Please try again later.",
          side: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => handleSend(inputValue);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  const downloadChat = () => {
    const chatText = messages.map(m => `${m.side === 'bot' ? 'St. Peter Assistant' : 'You'}: ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'st-peter-chat-history.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md h-[600px] bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#007A33] text-white p-4 flex items-center justify-between shadow-sm z-10">
          <div className="font-bold text-lg">St. Peter Digital Assistant</div>
          <button 
            onClick={downloadChat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-medium"
            title="Download Chat History"
            aria-label="Download Chat History"
          >
            <Download size={16} />
            <span>Save Chat</span>
          </button>
        </div>

        {/* Chat Box */}
        <div
          ref={chatBoxRef}
          className="flex-1 p-5 overflow-y-auto flex flex-col gap-3 bg-gray-50/50 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 max-w-[85%] ${
                  msg.side === 'bot' ? 'self-start' : 'self-end flex-row-reverse'
                }`}
              >
                {msg.side === 'bot' && <StPeterLogo />}
                <div
                  className={`p-3.5 rounded-2xl text-[0.95em] leading-relaxed shadow-sm ${
                    msg.side === 'bot'
                      ? 'bg-[#e9e9eb] text-gray-800 rounded-tl-sm'
                      : 'bg-[#007A33] text-white rounded-tr-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex gap-2 max-w-[85%] self-start"
              >
                <StPeterLogo />
                <div className="bg-[#e9e9eb] text-gray-800 rounded-2xl rounded-tl-sm p-3.5 shadow-sm flex items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
              </motion.div>
            )}
            {!isLoading && messages.length > 0 && messages[messages.length - 1].side === 'bot' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-2 mt-2 ml-10"
              >
                {SUGGESTED_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="bg-white border border-[#007A33] text-[#007A33] px-3 py-1.5 rounded-full text-[0.85em] font-medium hover:bg-[#007A33] hover:text-white transition-colors shadow-sm"
                  >
                    {reply}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-100 p-4 bg-white flex gap-2 items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message here..."
            disabled={isLoading}
            className="flex-1 border border-gray-200 p-3 rounded-full outline-none focus:border-[#007A33] focus:ring-1 focus:ring-[#007A33] transition-all bg-gray-50 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-[#007A33] text-white p-3 rounded-full hover:bg-[#005A26] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Send message"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
