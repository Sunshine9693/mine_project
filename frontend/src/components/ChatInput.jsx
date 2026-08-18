import React, { useState } from 'react';
import { Plus, Mic, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatInput = ({ onSend, onMicClick, placeholder = "Ask Anything..." }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    if (onSend) onSend(value);
    setValue('');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="glass-card rounded-full p-2 flex items-center gap-2 shadow-glass-card border border-white/60 w-full"
    >
      {/* Plus / Add Action */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2.5 rounded-full text-aura-text-secondary hover:text-aura-primary-purple hover:bg-aura-lavender/35 transition-colors focus:outline-none flex items-center justify-center"
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Main Text Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none py-2 px-3 text-sm md:text-base text-aura-text-primary placeholder-aura-text-muted focus:ring-0"
      />

      {/* Mic Shortcut */}
      <motion.button
        type="button"
        onClick={onMicClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-2.5 rounded-full text-aura-text-secondary hover:text-aura-primary-purple hover:bg-aura-lavender/35 transition-colors focus:outline-none flex items-center justify-center"
      >
        <Mic className="w-5 h-5" />
      </motion.button>

      {/* Send Message Button */}
      <motion.button
        type="submit"
        disabled={!value.trim()}
        whileHover={{ scale: value.trim() ? 1.05 : 1 }}
        whileTap={{ scale: value.trim() ? 0.95 : 1 }}
        className={`p-2.5 rounded-full flex items-center justify-center transition-colors focus:outline-none ${
          value.trim() 
            ? 'btn-gradient-purple text-white shadow-sm' 
            : 'bg-transparent text-aura-text-muted cursor-not-allowed'
        }`}
      >
        <Send className="w-4 h-4 md:w-5 md:h-5" />
      </motion.button>
    </form>
  );
};

export default ChatInput;
