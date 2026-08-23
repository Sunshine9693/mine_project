import React, { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Toast from '../components/Toast';

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const loadConversations = async () => {
    try {
      const { data } = await api.get('/conversations');
      setConversations(data.conversations || []);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const deleteConversation = async (event, id) => {
    event.stopPropagation();
    try {
      await api.delete(`/conversations/${id}`);
      setConversations((items) => items.filter((item) => item._id !== id));
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to delete conversation');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] select-none max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-3 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple border border-white/70 shadow-sm"
          title="Back to dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold tracking-wide text-aura-text-primary">Conversations</h2>
        <button
          onClick={() => navigate('/assistant')}
          className="p-3 rounded-full btn-gradient-purple text-white shadow-sm"
          title="New conversation"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-aura-text-muted">Loading conversations...</div>
      ) : conversations.length ? (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <div
              key={conversation._id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/assistant?conversation=${conversation._id}`)}
              onKeyDown={(event) => event.key === 'Enter' && navigate(`/assistant?conversation=${conversation._id}`)}
              className="glass-card hover:bg-white/45 p-4 rounded-2xl flex items-center justify-between transition-all duration-200 cursor-pointer border border-white/40 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-aura-lavender/40 text-aura-soft-purple">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-aura-text-primary truncate">{conversation.title}</div>
                  <div className="text-[10px] text-aura-text-muted mt-1">{conversation.messages?.length || 0} messages</div>
                </div>
              </div>
              <button
                onClick={(event) => deleteConversation(event, conversation._id)}
                className="p-2 rounded-full text-aura-text-muted hover:text-red-500 transition-colors"
                title="Delete conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-[26px] p-8 text-center text-sm text-aura-text-secondary border border-white/60">
          No saved conversations yet.
        </div>
      )}

      {toastMessage && <Toast message={toastMessage} type="error" onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default Conversations;
