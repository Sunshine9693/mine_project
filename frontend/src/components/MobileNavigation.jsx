import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Mic, History, FileText, User } from 'lucide-react';

const MobileNavigation = () => {
  const tabs = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Assistant', path: '/assistant', icon: Mic },
    { name: 'History', path: '/conversations', icon: History },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Profile', path: '/settings', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/70 backdrop-blur-glass border-t border-white/60 flex items-center justify-around px-4 pb-2 z-50 shadow-[0_-5px_25px_rgba(120,80,160,0.05)] rounded-t-[24px]">
      {menuTabs(tabs)}
    </nav>
  );
};

const menuTabs = (tabs) => {
  return tabs.map((tab) => (
    <NavLink
      key={tab.name}
      to={tab.path}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1.5 w-16 h-14 rounded-2xl transition-all duration-300 ${
          isActive
            ? 'text-aura-primary-purple scale-105'
            : 'text-aura-text-secondary hover:text-aura-primary-purple'
        }`
      }
    >
      <tab.icon className="w-5 h-5" />
      <span className="text-[10px] font-medium tracking-wide">
        {tab.name}
      </span>
    </NavLink>
  ));
};

export default MobileNavigation;
