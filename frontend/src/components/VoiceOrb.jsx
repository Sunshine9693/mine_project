import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceOrb = ({ state = 'idle', size = 'md' }) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48 md:w-56 md:h-56',
    lg: 'w-64 h-64 md:w-72 md:h-72',
  };

  // State-specific styles & animations
  const getStateConfig = () => {
    switch (state) {
      case 'listening':
        return {
          coreClass: 'bg-gradient-to-tr from-[#9B5DE5] via-[#B88BE8] to-[#E9DDF7] animate-blob scale-105',
          glowClass: 'bg-[#9B5DE5]/40 blur-3xl scale-110 duration-500',
          speedMultiplier: 1.5,
          text: 'Listening...',
          textColor: 'text-aura-primary-purple',
        };
      case 'thinking':
        return {
          coreClass: 'bg-gradient-to-br from-[#7040B8] via-[#9B5DE5] to-[#B88BE8] animate-blob',
          glowClass: 'bg-[#7040B8]/30 blur-2xl animate-pulse scale-95',
          speedMultiplier: 0.8,
          text: 'Thinking...',
          textColor: 'text-aura-soft-purple',
        };
      case 'speaking':
        return {
          coreClass: 'bg-gradient-to-tr from-[#8E4ED6] via-[#C58AF2] to-[#F4EFFF] animate-blob scale-102',
          glowClass: 'bg-[#8E4ED6]/30 blur-3xl scale-105',
          speedMultiplier: 1.2,
          text: 'Speaking...',
          textColor: 'text-aura-deep-purple',
        };
      case 'error':
        return {
          coreClass: 'bg-gradient-to-tr from-[#E63946] via-[#B88BE8] to-[#F5F0FA] animate-tremble',
          glowClass: 'bg-[#E63946]/20 blur-2xl',
          speedMultiplier: 1,
          text: 'Something went wrong',
          textColor: 'text-red-500',
        };
      case 'idle':
      default:
        return {
          coreClass: 'bg-gradient-to-tr from-[#9B5DE5] via-[#C58AF2] to-[#E9DDF7] animate-blob animate-breath',
          glowClass: 'bg-[#9B5DE5]/25 blur-2xl scale-100',
          speedMultiplier: 1,
          text: 'AURA',
          textColor: 'text-aura-text-secondary',
        };
    }
  };

  const config = getStateConfig();

  return (
    <div className="flex flex-col items-center justify-center relative">
      {/* Outer Wrapper */}
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        
        {/* Outer Ripple Rings (Only for listening state) */}
        {state === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border border-aura-soft-purple/40 animate-ripple" style={{ animationDelay: '0s' }} />
            <div className="absolute inset-0 rounded-full border border-aura-primary-purple/30 animate-ripple" style={{ animationDelay: '0.6s' }} />
            <div className="absolute inset-0 rounded-full border border-aura-deep-purple/20 animate-ripple" style={{ animationDelay: '1.2s' }} />
          </>
        )}

        {/* Ambient Blur Under-Glow */}
        <div className={`absolute -inset-4 rounded-full transition-all duration-700 ${config.glowClass}`} />

        {/* Liquid Marble core */}
        <div className="absolute inset-0 w-full h-full rounded-full overflow-hidden transition-transform duration-500 shadow-glass-card">
          
          {/* Layer 1 - Deep Gradient Base */}
          <div className={`absolute inset-0 w-full h-full transition-all duration-700 ${config.coreClass}`} />

          {/* Layer 2 - Swirling Liquid Layer */}
          <div 
            className="absolute -inset-4 bg-gradient-to-bl from-[#B88BE8]/40 via-transparent to-[#7040B8]/40 opacity-70 animate-spin-slow mix-blend-overlay"
            style={{ animationDuration: `${20 / config.speedMultiplier}s` }}
          />

          {/* Layer 3 - Reverse Swirling Accent */}
          <div 
            className="absolute -inset-4 bg-gradient-to-tr from-[#E9DDF7]/30 via-transparent to-[#9B5DE5]/30 opacity-60 animate-spin-reverse-slow mix-blend-color-dodge"
            style={{ animationDuration: `${25 / config.speedMultiplier}s` }}
          />

          {/* 3D Glass Sphere Highlight / Reflection */}
          <div className="absolute inset-0 pointer-events-none rounded-full bg-gradient-to-tr from-transparent via-transparent to-white/30" />
          
          {/* Light Reflection Spot */}
          <div className="absolute top-[8%] left-[12%] w-[25%] h-[25%] rounded-full bg-gradient-to-br from-white/60 to-white/0 pointer-events-none filter blur-[1px]" />
          
          {/* Bottom Shadow Depth */}
          <div className="absolute bottom-[4%] right-[10%] w-[35%] h-[20%] rounded-full bg-gradient-to-t from-black/10 to-transparent pointer-events-none filter blur-[2px]" />
        </div>
      </div>

      {/* State Text Label */}
      <AnimatePresence mode="wait">
        <motion.div
          key={config.text}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.3 }}
          className={`mt-8 text-sm font-medium tracking-wide uppercase ${config.textColor}`}
        >
          {config.text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default VoiceOrb;
