import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import GlassCard from './GlassCard';

const QuickActionCard = ({ title, description, icon: Icon, onClick, delay = 0 }) => {
  return (
    <GlassCard
      hover
      onClick={onClick}
      delay={delay}
      className="flex flex-col justify-between h-[140px] md:h-[160px] cursor-pointer"
    >
      <div className="flex justify-between items-start w-full">
        <div className="p-2.5 rounded-2xl bg-aura-lavender/60 text-aura-deep-purple">
          {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6" />}
        </div>
        <div className="p-1.5 rounded-full bg-white/70 text-aura-text-secondary hover:text-aura-primary-purple transition-colors shadow-sm">
          <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
        </div>
      </div>
      <div>
        <h4 className="font-semibold text-sm md:text-base text-aura-text-primary mb-1">
          {title}
        </h4>
        <p className="text-xs text-aura-text-muted line-clamp-1">
          {description}
        </p>
      </div>
    </GlassCard>
  );
};

export default QuickActionCard;
