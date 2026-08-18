import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Bell, 
  FileText, 
  CheckSquare, 
  Search, 
  BarChart2, 
  Settings, 
  ArrowLeft 
} from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

const Placeholder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Resolve title and icon based on current path
  const routeConfigs = {
    '/conversations': { title: 'Conversations', icon: MessageSquare, desc: 'Manage your history of dialogues and summaries.' },
    '/reminders': { title: 'Reminders', icon: Bell, desc: 'Keep track of scheduled alerts and speech reminders.' },
    '/notes': { title: 'Notes', icon: FileText, desc: 'Review transcripts formatted into organized meeting notes.' },
    '/tasks': { title: 'Tasks', icon: CheckSquare, desc: 'Add items and manage tasks extracted from your sessions.' },
    '/search': { title: 'Search', icon: Search, desc: 'Perform fast semantic searches across all assistant records.' },
    '/analytics': { title: 'Analytics', icon: BarChart2, desc: 'Review metrics about voice records and activity history.' },
    '/settings': { title: 'Settings', icon: Settings, desc: 'Manage voice preferences, styling systems, and integration keys.' },
  };

  const path = location.pathname;
  const config = routeConfigs[path] || { title: 'Coming Soon', icon: Settings, desc: 'This section is being created for future phases.' };
  const Icon = config.icon;

  return (
    <div className="flex-1 flex flex-col justify-center items-center min-h-[calc(100vh-2rem)] py-6 px-4 select-none max-w-xl mx-auto w-full text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <GlassCard className="p-8 md:p-12 flex flex-col items-center justify-center space-y-6 md:space-y-8 border border-white/60 shadow-glass-card">
          {/* Icon Circle */}
          <div className="p-5 rounded-3xl bg-aura-lavender/55 text-aura-primary-purple shadow-sm">
            <Icon className="w-10 h-10 md:w-12 md:h-12" />
          </div>

          {/* Heading */}
          <div className="space-y-2 md:space-y-3">
            <h1 className="text-2xl md:text-3xl font-semibold text-aura-text-primary">
              {config.title}
            </h1>
            <p className="text-sm text-aura-text-secondary max-w-xs mx-auto">
              {config.desc}
            </p>
          </div>

          {/* Badge */}
          <span className="px-3.5 py-1.5 rounded-full bg-white/70 text-[10px] md:text-xs font-semibold tracking-wider text-aura-soft-purple uppercase border border-aura-lavender">
            Phase 2 Feature
          </span>

          {/* Action Back Button */}
          <div className="pt-2">
            <PrimaryButton 
              variant="glass"
              onClick={() => navigate('/dashboard')}
              icon={<ArrowLeft className="w-4 h-4" />}
              className="px-6 py-2.5 text-sm"
            >
              Back to Dashboard
            </PrimaryButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Placeholder;
