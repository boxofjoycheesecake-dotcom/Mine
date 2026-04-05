/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Message = {
  id: string;
  text: string;
  side: 'user' | 'bot';
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I am your St. Peter guide. How can I help you today? (Try asking about "Plans" or type something silly to test my recovery!)',
      side: 'bot',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogic = (input: string, currentErrorCount: number) => {
    const lowerInput = input.toLowerCase();
    let newErrorCount = currentErrorCount;
    const newMessages: Message[] = [];

    const addBotMessage = (text: string) => {
      newMessages.push({
        id: Date.now().toString() + Math.random().toString(),
        text,
        side: 'bot',
      });
    };

    if (lowerInput.includes('plan') || lowerInput.includes('price')) {
      addBotMessage('We have several St. Peter Life Plans tailored for you. Would you like to see our Pre-need or Memorial service options?');
      newErrorCount = 0;
    } else if (lowerInput.includes('banana') || lowerInput.includes('potato') || lowerInput.length < 2) {
      newErrorCount++;
      if (newErrorCount === 1) {
        addBotMessage("I'm not sure I followed that. Were you asking about a specific life plan name?");
      } else if (newErrorCount === 2) {
        addBotMessage("I'm still a bit confused! 😊 Did you mean you wanted to speak to an agent, or should we go back to the main menu?");
      } else {
        addBotMessage("I want to make sure you get the right information. I'm connecting you to a live St. Peter representative now. Please stay on the line.");
        addBotMessage("SYSTEM: Connecting to Human Agent...");
      }
    } else {
      addBotMessage("That's interesting! I'd love to help you with that. Could you tell me a bit more, or would you like to see our funeral service checklist?");
      newErrorCount = 0;
    }

    setMessages((prev) => [...prev, ...newMessages]);
    setErrorCount(newErrorCount);
  };

  const sendMessage = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      side: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    // Simulate Bot Thinking
    setTimeout(() => {
      handleLogic(text, errorCount);
    }, 600);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md h-[600px] bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#004a99] text-white p-5 text-center font-bold text-xl shadow-sm z-10">
          St. Peter Digital Assistant
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
                className={`max-w-[80%] p-3.5 rounded-2xl text-[0.95em] leading-relaxed shadow-sm ${
                  msg.side === 'bot'
                    ? 'bg-[#e9e9eb] text-gray-800 self-start rounded-bl-sm'
                    : 'bg-[#004a99] text-white self-end rounded-br-sm'
                }`}
              >
                {msg.text}
              </motion.div>
            ))}
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
            className="flex-1 border border-gray-200 p-3 rounded-full outline-none focus:border-[#004a99] focus:ring-1 focus:ring-[#004a99] transition-all bg-gray-50"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            className="bg-[#004a99] text-white p-3 rounded-full hover:bg-[#00356e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            aria-label="Send message"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
