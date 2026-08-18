import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', delay = 0, hover = false, onClick }) => {
  const CardComponent = onClick ? motion.button : motion.div;

  const cardStyles = `glass-card rounded-[24px] p-6 text-aura-text-primary text-left transition-all duration-300 w-full ${className} ${
    hover ? 'hover:translate-y-[-4px] hover:shadow-[0_20px_50px_rgba(120,80,160,0.15)] active:scale-[0.98]' : ''
  }`;

  return (
    <CardComponent
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      onClick={onClick}
      className={cardStyles}
    >
      {children}
    </CardComponent>
  );
};

export default GlassCard;
