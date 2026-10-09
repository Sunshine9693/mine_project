import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfileHeader = ({
  username = '',
  timeOfDay = 'Morning',
  avatar,
  isBirthday = false,
  reducedMotion = false,
  accentColor = '#9B5DE5',
  onProfileClick,
}) => {
  const displayName = username || 'User';
  const greetingMessage = isBirthday ? 'Happy Birthday' : `Good ${timeOfDay}`;

  return (
    <div className="w-full space-y-6 select-none">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Open profile and personalization settings"
          className="flex items-center gap-3 rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-aura-primary-purple focus-visible:ring-offset-2"
        >
          <div className="relative">
            <div
              className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border border-white/80 p-[2px] shadow-sm flex items-center justify-center font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${accentColor}, #C58AF2)` }}
            >
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-full h-full object-cover rounded-full" />
              ) : (
                displayName.charAt(0)
              )}
            </div>
            {isBirthday && (
              <div className="absolute -top-2 -right-1 flex h-5 w-5 items-start justify-center" role="img" aria-label="Birthday party hat">
                <span className="absolute top-0 h-3.5 w-3.5 rounded-full bg-[#FFD166] shadow-sm" />
                <span className="absolute top-0.5 h-3 w-2.5 [clip-path:polygon(50%_0,100%_100%,0_100%)] bg-[repeating-linear-gradient(135deg,#E879F9_0_3px,#FFD166_3px_6px)]" />
                <span className="absolute top-0 h-1 w-1 rounded-full bg-[#FB7185]" />
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
          </div>
          <div>
            <p className="text-xs text-aura-text-muted font-medium tracking-wide">{isBirthday ? 'Birthday' : 'Hello'}</p>
            <h3 className="text-sm md:text-base font-bold text-aura-text-primary">
              {isBirthday ? `Celebrate, ${displayName}` : `Welcome Back, ${displayName}`}
            </h3>
          </div>
        </button>

        <motion.button
          whileHover={reducedMotion ? undefined : { scale: 1.03, y: -1 }}
          whileTap={reducedMotion ? undefined : { scale: 0.97 }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-aura-deep-purple bg-gradient-to-r from-aura-lavender to-white border border-white/60 shadow-[0_4px_12px_rgba(120,80,160,0.05)] hover:shadow-md transition-all duration-300"
        >
          <Sparkles className={`w-3.5 h-3.5 text-aura-primary-purple${reducedMotion ? '' : ' animate-pulse'}`} />
          <span>Try Premium</span>
        </motion.button>
      </div>

      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-aura-text-primary leading-tight">
          {isBirthday ? `${greetingMessage}, ${displayName}! 🎂` : `${greetingMessage},`}
        </h1>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-aura-soft-purple leading-tight">
          {isBirthday ? 'AURA is celebrating with you today!' : 'How May I Assist You Today?'}
        </h2>
        {isBirthday && (
          <p className="mt-3 text-sm text-aura-text-secondary">
            AURA hopes your day is filled with happiness, success and beautiful moments.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
