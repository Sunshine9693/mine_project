import React from 'react';
import { motion } from 'framer-motion';

const ChatMessage = ({ message, index }) => {
  const isAura = message.sender === 'aura';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className={`flex w-full mb-4 ${isAura ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`max-w-[80%] md:max-w-[70%] px-5 py-3.5 rounded-[22px] text-sm md:text-base leading-relaxed ${
        isAura 
          ? 'glass-card border border-white/60 text-aura-text-primary rounded-tl-sm shadow-[0_4px_15px_rgba(120,80,160,0.02)]' 
          : 'btn-gradient-purple text-white rounded-tr-sm shadow-md'
      }`}>
        <p>{message.text}</p>
        <span className={`text-[10px] block mt-1.5 text-right ${
          isAura ? 'text-aura-text-muted' : 'text-white/70'
        }`}>
          {message.timestamp || 'Just now'}
        </span>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
