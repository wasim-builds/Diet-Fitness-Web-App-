import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Activity, Utensils, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { generateCoachResponse } from '../../services/ai';

const INITIAL_MESSAGES = [
  {
    id: 1,
    type: 'ai',
    text: "Hello! I'm your FitPlan AI Coach. I've reviewed your profile and goals. How can I help you crush your fitness targets today?",
    time: 'Just now'
  }
];

const SUGGESTIONS = [
  { icon: <Utensils size={16} />, text: 'What should I eat for recovery?' },
  { icon: <Dumbbell size={16} />, text: 'Suggest a 20m HIIT workout' },
  { icon: <Activity size={16} />, text: 'How to improve my sleep?' }
];

const AICoach = () => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    // Add user message
    const newUserMsg = {
      id: Date.now(),
      type: 'user',
      text: text,
      time: 'Just now'
    };
    
    // We create a snapshot of the messages array including the new message
    // so we can pass the full context to the AI
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    // Call real Gemini API
    const aiResponseText = await generateCoachResponse(updatedMessages, userProfile);
    
    const aiResponse = {
      id: Date.now() + 1,
      type: 'ai',
      text: aiResponseText,
      time: 'Just now'
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  return (
    <div className="animate-in fade-in duration-500 py-6 pb-8 h-[calc(100vh-5rem)] flex flex-col max-w-5xl mx-auto">
      
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            AI Coach <Sparkles className="text-green-500 w-6 h-6 animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Your 24/7 personalized fitness and nutrition expert.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl border border-green-500/20">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-bold">Online</span>
        </div>
      </div>

      <div className="flex-1 glass-card rounded-[2rem] flex flex-col overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative z-10 hide-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-4 max-w-[85%] ${msg.type === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.type === 'ai' ? 'bg-gradient-to-br from-green-400 to-green-600 text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-slate-800 border border-white/10'}`}>
                  {msg.type === 'ai' ? <Bot size={20} /> : <User size={20} className="text-slate-300" />}
                </div>

                {/* Bubble */}
                <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-5 py-3.5 rounded-2xl ${
                    msg.type === 'ai' 
                      ? 'glass-panel text-slate-200 border-green-500/10 rounded-tl-none' 
                      : 'bg-green-500 text-slate-950 rounded-tr-none shadow-[0_4px_15px_rgba(34,197,94,0.2)] font-medium'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 mt-2 px-1">{msg.time}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 max-w-[85%]"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-slate-950 shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center flex-shrink-0">
                <Bot size={20} />
              </div>
              <div className="glass-panel px-5 py-4 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length < 3 && !isTyping && (
          <div className="px-6 md:px-8 pb-4 flex flex-wrap gap-2 relative z-10">
            {SUGGESTIONS.map((sug, i) => (
              <button 
                key={i}
                onClick={() => handleSend(sug.text)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl transition-colors border border-white/5"
              >
                <span className="text-green-500">{sug.icon}</span> {sug.text}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 md:p-8 pt-4 border-t border-white/5 relative z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-3 bg-black/40 p-2 pl-6 rounded-[2rem] border border-white/10 focus-within:border-green-500/50 transition-colors"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about fitness or nutrition..."
              className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-green-500 hover:bg-green-400 text-slate-950 w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:hover:bg-green-500"
            >
              <Send size={20} className="ml-1" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AICoach;
