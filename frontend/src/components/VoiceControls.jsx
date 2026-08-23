import React from 'react';
import { Mic, MessageSquare, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const VoiceControls = ({ isListening, isSpeaking, onToggleMic, onToggleChat, onClear }) => {
  return (
    <div className="flex items-center justify-center gap-6 md:gap-8 py-6 w-full max-w-md mx-auto">
      {/* Text Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleChat}
        aria-label="Open text chat"
        className="p-3.5 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple transition-colors shadow-sm focus:outline-none"
        title="Toggle Keyboard Chat"
      >
        <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
      </motion.button>

      {/* Main Microphone Button */}
      <div className="relative">
        {/* Pulsing ring if listening */}
        {isListening && (
          <span className="absolute -inset-2 rounded-full bg-aura-primary-purple/20 animate-ping pointer-events-none" />
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggleMic}
          aria-label={isSpeaking ? 'Stop speaking' : isListening ? 'Stop listening' : 'Start voice input'}
          className={`p-5 rounded-full flex items-center justify-center transition-all duration-300 shadow-glass-button focus:outline-none ${
            isListening
              ? 'btn-gradient-purple text-white'
              : 'glass-card text-aura-primary-purple hover:bg-aura-lavender/40'
          }`}
          title={isSpeaking ? "Stop Speaking" : isListening ? "Stop Listening" : "Start Listening"}
        >
          <Mic className="w-7 h-7 md:w-8 md:h-8" />
        </motion.button>
      </div>

      {/* Clear/Reset Button */}
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClear}
        aria-label="Clear conversation"
        className="p-3.5 rounded-full glass-card text-aura-text-secondary hover:text-red-500 transition-colors shadow-sm focus:outline-none"
        title="Clear Transcript"
      >
        <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
      </motion.button>
    </div>
  );
};

export default VoiceControls;
