import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  CheckSquare,
  Bell,
  Sparkles,
  Clock,
  ChevronRight,
  Calendar,
  Search,
  MessageSquare,
  Music,
  Plus,
  Calculator,
  CircleDollarSign,
  CloudSun,
  Ruler
} from 'lucide-react';
import ProfileHeader from '../components/ProfileHeader';
import ProfilePanel from '../components/ProfilePanel';
import QuickActionCard from '../components/QuickActionCard';
import ChatInput from '../components/ChatInput';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const getTimeOfDayForTimezone = (timezone) => {
  if (!timezone) return 'Morning';

  try {
    const hour = Number(
      new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      }).format(new Date())
    );

    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    return 'Evening';
  } catch (error) {
    return 'Morning';
  }
};

const isBirthdayToday = (birthday, timezone) => {
  if (!birthday || !timezone) return false;

  try {
    const [year, month, day] = birthday.split('-').map((value) => Number(value));
    if (!year || !month || !day) return false;

    const todayParts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const monthPart = todayParts.find((part) => part.type === 'month')?.value;
    const dayPart = todayParts.find((part) => part.type === 'day')?.value;
    return Number(monthPart) === month && Number(dayPart) === day;
  } catch (error) {
    return false;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [profileOpen, setProfileOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [conversationId, setConversationId] = useState(null);
  const [summary, setSummary] = useState({ notes: { total: 0, pinned: 0, recent: [] }, tasks: { total: 0, completed: 0, pending: 0, highPriority: 0 }, reminders: { today: 0, upcoming: 0, completed: 0 } });
  const sendingRef = React.useRef(false);
  const currentTimeOfDay = getTimeOfDayForTimezone(user?.timezone || 'Asia/Kolkata');
  const birthdayToday = isBirthdayToday(user?.birthday, user?.timezone || 'Asia/Kolkata');

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
  };

  const quickActions = [
    { title: 'New Note', description: 'Capture ideas instantly', icon: FileText, path: '/notes' },
    { title: 'New Task', description: 'Plan work and goals', icon: CheckSquare, path: '/tasks' },
    { title: 'New Reminder', description: 'Stay on schedule', icon: Bell, path: '/reminders' },
    { title: 'Ask AURA', description: 'Use AI for productivity', icon: Sparkles, path: '/assistant' },
  ];

  const utilityQuickActions = [
    { title: 'Calculator', description: 'Quick equations', icon: Calculator, path: '/utilities?tool=calculator' },
    { title: 'Currency', description: 'Live conversion', icon: CircleDollarSign, path: '/utilities?tool=currency' },
    { title: 'Weather', description: 'Current conditions', icon: CloudSun, path: '/utilities?tool=weather' },
    { title: 'Unit Converter', description: 'Measure and convert', icon: Ruler, path: '/utilities?tool=unit' },
  ];

  const filterPills = ['All', 'Reminders', 'Music', 'Searches'];

  // Mock chat history
  const allHistory = [
    { id: 1, title: 'Draft email to design team', category: 'Searches', time: '10m ago', icon: MessageSquare },
    { id: 2, title: 'Call dentist tomorrow at 3 PM', category: 'Reminders', time: '2h ago', icon: Calendar },
    { id: 3, title: 'Ambient focus study beats', category: 'Music', time: 'Yesterday', icon: Music },
    { id: 4, title: 'React Router deployment docs', category: 'Searches', time: 'Yesterday', icon: Search },
    { id: 5, title: 'Set alert: Hydration check', category: 'Reminders', time: '2 days ago', icon: Calendar },
  ];

  const filteredHistory = activeTab === 'All' 
    ? allHistory 
    : allHistory.filter(item => item.category === activeTab);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const { data } = await api.get('/dashboard/summary');
        if (data.success) {
          setSummary(data.summary);
        }
      } catch (error) {
        console.error('[AURA Dashboard Summary Error]:', error);
      }
    };

    loadSummary();
  }, []);

  const handleActionClick = (action) => {
    if (action.path) {
      navigate(action.path);
      return;
    }
    showToast(`Quick Action: "${action.title}"`, 'info');
  };

  const handleChatSend = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || sendingRef.current) return;

    sendingRef.current = true;
    try {
      const { data } = await api.post('/ai/chat', {
        message: trimmed,
        conversationId,
      });

      if (data.conversationId) {
        setConversationId(data.conversationId);
      }

      showToast(data.response || 'Response received', 'success');
    } catch (error) {
      console.error('[AURA Dashboard Chat Error]:', error);
      showToast(error.response?.data?.message || 'AURA could not process that request. Please try again.', 'error');
    } finally {
      sendingRef.current = false;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between min-h-[calc(100vh-2rem)] select-none">
      
      {/* Top Section */}
      <div className="space-y-6">
        {/* Profile and Greetings */}
        <ProfileHeader
          username={user?.name || ''}
          timeOfDay={currentTimeOfDay}
          avatar={user?.avatar}
          isBirthday={birthdayToday}
          reducedMotion={Boolean(user?.preferences?.reducedMotion)}
          accentColor={user?.preferences?.accentColor || '#9B5DE5'}
          onProfileClick={() => setProfileOpen(true)}
        />

        <div className="grid grid-cols-2 gap-4 md:gap-5 pt-2">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              delay={index * 0.08}
              onClick={() => handleActionClick(action)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-white/60">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-aura-text-muted">Notes</span><FileText className="w-4 h-4 text-aura-primary-purple" /></div>
            <div className="text-2xl font-semibold text-aura-text-primary">{summary.notes.total}</div>
            <div className="text-[11px] text-aura-text-secondary mt-1">{summary.notes.pinned} pinned</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-white/60">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-aura-text-muted">Tasks</span><CheckSquare className="w-4 h-4 text-aura-primary-purple" /></div>
            <div className="text-2xl font-semibold text-aura-text-primary">{summary.tasks.pending}</div>
            <div className="text-[11px] text-aura-text-secondary mt-1">{summary.tasks.completed} done / {summary.tasks.highPriority} high priority</div>
          </div>
          <div className="glass-card p-4 rounded-2xl border border-white/60">
            <div className="flex items-center justify-between mb-2"><span className="text-xs text-aura-text-muted">Reminders</span><Bell className="w-4 h-4 text-aura-primary-purple" /></div>
            <div className="text-2xl font-semibold text-aura-text-primary">{summary.reminders.today}</div>
            <div className="text-[11px] text-aura-text-secondary mt-1">{summary.reminders.upcoming} upcoming</div>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-semibold text-aura-text-primary text-base md:text-lg">
              Smart Utilities
            </h3>
            <button
              onClick={() => navigate('/utilities')}
              className="text-xs font-semibold text-aura-primary-purple hover:text-aura-deep-purple transition-colors flex items-center gap-0.5"
            >
              <span>View All Utilities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {utilityQuickActions.map((action, index) => (
              <QuickActionCard
                key={action.title}
                title={action.title}
                description={action.description}
                icon={action.icon}
                delay={index * 0.06}
                onClick={() => handleActionClick(action)}
              />
            ))}
          </div>
        </div>

        {/* Chat History Section */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-semibold text-aura-text-primary text-base md:text-lg">
              Chat History
            </h3>
            <button 
              onClick={() => navigate('/conversations')} 
              className="text-xs font-semibold text-aura-primary-purple hover:text-aura-deep-purple transition-colors flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2.5 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
            {filterPills.map((pill) => {
              const isActive = activeTab === pill;
              return (
                <button
                  key={pill}
                  onClick={() => setActiveTab(pill)}
                  className={`flex items-center justify-center min-w-fit px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-300 whitespace-nowrap text-center ${
                    isActive
                      ? 'btn-gradient-purple text-white shadow-sm'
                      : 'glass-card text-aura-text-secondary hover:text-aura-primary-purple hover:bg-white/50 border border-white/60'
                  }`}
                >
                  {pill}
                </button>
              );
            })}
          </div>

          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, idx) => (
                <div 
                  key={item.id}
                  onClick={() => showToast(`Opening logs for: "${item.title}"`, 'info')}
                  className="glass-card hover:bg-white/45 p-4 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer border border-white/40 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-aura-lavender/40 text-aura-soft-purple">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-aura-text-primary line-clamp-1">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-aura-text-muted font-medium pr-1 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-aura-text-muted">
                No items in this category yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Chat Input */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#F5F0FA] via-[#F5F0FA]/95 to-transparent pt-6 pb-2 w-full max-w-4xl mx-auto">
        <ChatInput 
          onSend={handleChatSend} 
          onMicClick={() => navigate('/assistant')} 
        />
      </div>

      {/* Toasts */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}
      {profileOpen && (
        <ProfilePanel
          onClose={() => setProfileOpen(false)}
          reducedMotion={Boolean(user?.preferences?.reducedMotion)}
        />
      )}
    </div>
  );
};

export default Dashboard;
