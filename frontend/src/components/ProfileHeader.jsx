import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileHeader = ({ username = "Sarah", timeOfDay = "Morning", avatar }) => {
  return (
    <div className="w-full space-y-6 select-none">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-gradient-to-tr from-[#B88BE8] to-[#C58AF2] border border-white/80 p-[2px] shadow-sm flex items-center justify-center font-semibold text-white">
              {avatar ? (
                <img src={avatar} alt={username} className="w-full h-full object-cover rounded-full" />
              ) : (
                username.charAt(0)
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <p className="text-xs text-aura-text-muted font-medium tracking-wide">Hello</p>
            <h3 className="text-sm md:text-base font-bold text-aura-text-primary">
              Welcome Back, {username}
            </h3>
          </div>
        </div>

        {/* Premium Action Button */}
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-aura-deep-purple bg-gradient-to-r from-aura-lavender to-white border border-white/60 shadow-[0_4px_12px_rgba(120,80,160,0.05)] hover:shadow-md transition-all duration-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-aura-primary-purple animate-pulse" />
          <span>Try Premium</span>
        </motion.button>
      </div>

      {/* Main Large Greeting */}
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-aura-text-primary leading-tight">
          Good {timeOfDay},
        </h1>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-aura-soft-purple leading-tight">
          How May I Assist You Today?
        </h2>
      </div>
    </div>
  );
};

export default ProfileHeader;
