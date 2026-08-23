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
  Plus
} from 'lucide-react';
import ProfileHeader from '../components/ProfileHeader';
import QuickActionCard from '../components/QuickActionCard';
import ChatInput from '../components/ChatInput';
import Toast from '../components/Toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');
  const [conversationId, setConversationId] = useState(null);
  const [summary, setSummary] = useState({ notes: { total: 0, pinned: 0, recent: [] }, tasks: { total: 0, completed: 0, pending: 0, highPriority: 0 }, reminders: { today: 0, upcoming: 0, completed: 0 } });
  const sendingRef = React.useRef(false);

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
        <ProfileHeader username={user?.name || "Sarah"} timeOfDay="Morning" avatar={user?.avatar} />

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
    </div>
  );
};

export default Dashboard;
