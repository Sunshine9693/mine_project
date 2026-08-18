import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Mic, 
  MessageSquare, 
  Bell, 
  FileText, 
  CheckSquare, 
  Search, 
  BarChart2, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Assistant', path: '/assistant', icon: Mic },
    { name: 'Conversations', path: '/conversations', icon: MessageSquare },
    { name: 'Reminders', path: '/reminders', icon: Bell },
    { name: 'Notes', path: '/notes', icon: FileText },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-[calc(100vh-2rem)] sticky top-4 left-4 glass-card rounded-[30px] p-6 shadow-glass-card border border-white/60 select-none my-4">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#9B5DE5] to-[#C58AF2] shadow-sm animate-breath" />
        <span className="text-xl font-bold tracking-wider text-gradient-purple uppercase">Sunshine</span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-aura-soft-purple/20 text-aura-deep-purple shadow-sm border-l-4 border-aura-primary-purple' 
                  : 'text-aura-text-secondary hover:text-aura-primary-purple hover:bg-white/40'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="mt-auto pt-4 border-t border-aura-lavender/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-[11px] font-semibold tracking-[0.16em] uppercase text-aura-text-secondary hover:bg-white/40 hover:text-aura-primary-purple transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Log Out
        </button>
        <div className="mt-3 text-center">
          <span className="text-[10px] text-aura-text-muted font-medium tracking-widest uppercase">
            Sunshine v1.0.0
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
