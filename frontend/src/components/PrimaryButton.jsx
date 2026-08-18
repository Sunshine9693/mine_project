import React from 'react';
import { motion } from 'framer-motion';

const PrimaryButton = ({ children, onClick, className = '', icon, variant = 'primary' }) => {
  const baseStyles = "flex items-center justify-center gap-2 font-medium transition-all px-6 py-3.5 rounded-full text-base focus:outline-none shadow-glass-button";
  
  const variants = {
    primary: "btn-gradient-purple text-white hover:opacity-90 active:scale-[0.98]",
    glass: "glass-card text-aura-primary-purple hover:bg-aura-lavender/50 active:scale-[0.98] border border-aura-soft-purple/30",
    text: "text-aura-text-secondary hover:text-aura-primary-purple active:scale-95 px-4 shadow-none"
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon && <span className="w-5 h-5 flex items-center justify-center">{icon}</span>}
      {children}
    </motion.button>
  );
};

export default PrimaryButton;
