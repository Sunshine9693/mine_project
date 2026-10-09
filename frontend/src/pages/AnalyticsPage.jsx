import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bell,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Lock,
  MemoryStick,
  MessageSquareText,
  Sparkles,
  Tag,
} from 'lucide-react';
import api from '../services/api';

const formatTimestamp = (value) => {
  if (!value) return 'Just now';

  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch (error) {
    return 'Recently';
  }
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/analytics/overview');
        if (data.success) {
          setAnalytics(data);
        }
      } catch (error) {
        console.error('[AURA Analytics Page Error]:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-2rem)] items-center justify-center text-sm font-medium uppercase tracking-[0.25em] text-aura-text-muted">
        Loading analytics...
      </div>
    );
  }

  const summary = analytics?.summary || {
    notes: { total: 0, pinned: 0 },
    tasks: { total: 0, completed: 0, pending: 0, highPriority: 0 },
    reminders: { total: 0, active: 0, completed: 0, upcoming: 0 },
    memory: { total: 0, categories: [] },
    conversations: { total: 0, messages: 0 },
  };

  const privacy = analytics?.privacy || {};
  const activity = analytics?.activity || [];
  const insights = analytics?.insights || [];

  return (
    <div className="flex-1 min-h-[calc(100vh-2rem)] py-6 px-4 md:px-6 select-none">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-aura-text-muted">Insights</p>
            <h1 className="mt-2 text-3xl font-semibold text-aura-text-primary">Analytics & Activity</h1>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="glass-card rounded-[24px] border border-white/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-aura-text-muted">Notes</span>
              <FileText className="h-4 w-4 text-aura-primary-purple" />
            </div>
            <div className="text-3xl font-semibold text-aura-text-primary">{summary.notes.total}</div>
            <div className="mt-2 text-xs text-aura-text-secondary">{summary.notes.pinned} pinned</div>
          </div>

          <div className="glass-card rounded-[24px] border border-white/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-aura-text-muted">Tasks</span>
              <CheckCircle2 className="h-4 w-4 text-aura-primary-purple" />
            </div>
            <div className="text-3xl font-semibold text-aura-text-primary">{summary.tasks.completed}</div>
            <div className="mt-2 text-xs text-aura-text-secondary">{summary.tasks.pending} pending / {summary.tasks.highPriority} high-priority</div>
          </div>

          <div className="glass-card rounded-[24px] border border-white/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-aura-text-muted">Reminders</span>
              <Bell className="h-4 w-4 text-aura-primary-purple" />
            </div>
            <div className="text-3xl font-semibold text-aura-text-primary">{summary.reminders.active}</div>
            <div className="mt-2 text-xs text-aura-text-secondary">{summary.reminders.completed} done / {summary.reminders.upcoming} upcoming</div>
          </div>

          <div className="glass-card rounded-[24px] border border-white/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-aura-text-muted">Memory</span>
              <MemoryStick className="h-4 w-4 text-aura-primary-purple" />
            </div>
            <div className="text-3xl font-semibold text-aura-text-primary">{summary.memory.total}</div>
            <div className="mt-2 text-xs text-aura-text-secondary">{summary.conversations.messages} saved conversation messages</div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-aura-text-primary">Recent activity</h2>
            </div>

            <div className="space-y-3">
              {activity.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/70 bg-white/25 p-4 text-sm text-aura-text-secondary">
                  No activity recorded yet. Notes, tasks, reminders, and memory updates will appear here.
                </div>
              ) : (
                activity.map((item) => (
                  <div key={`${item.type}-${item.title}-${item.timestamp}`} className="flex items-start gap-3 rounded-2xl border border-white/60 bg-white/25 p-3">
                    <div className="mt-1 rounded-xl bg-aura-soft-purple/40 p-2 text-aura-primary-purple">
                      {item.type === 'Note' ? <FileText className="h-4 w-4" /> : item.type === 'Task' ? <CheckCircle2 className="h-4 w-4" /> : item.type === 'Reminder' ? <Bell className="h-4 w-4" /> : <MemoryStick className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium text-aura-text-primary">{item.title}</p>
                        <span className="text-[10px] uppercase tracking-[0.16em] text-aura-text-muted">{item.type}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3 text-xs text-aura-text-secondary">
                        <span>{item.meta}</span>
                        <span>{formatTimestamp(item.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-aura-text-primary">Insights</h2>
              </div>

              <div className="space-y-3">
                {insights.map((insight) => (
                  <div key={insight.label} className="rounded-2xl border border-white/60 bg-white/25 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs uppercase tracking-[0.18em] text-aura-text-muted">{insight.label}</span>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] ${insight.tone === 'positive' ? 'bg-emerald-100 text-emerald-700' : insight.tone === 'steady' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        {insight.tone}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium text-aura-text-primary">{insight.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-aura-text-primary">Privacy</h2>
              </div>

              <div className="space-y-3 text-sm text-aura-text-secondary">
                <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/25 px-3 py-2">
                  <span>Memory enabled</span>
                  <span className="font-medium text-aura-text-primary">{privacy.memoryEnabled ? 'On' : 'Off'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/25 px-3 py-2">
                  <span>Voice enabled</span>
                  <span className="font-medium text-aura-text-primary">{privacy.voiceEnabled ? 'On' : 'Off'}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/25 px-3 py-2">
                  <span>Theme</span>
                  <span className="font-medium text-aura-text-primary">{privacy.theme}</span>
                </div>
                <div className="rounded-2xl border border-white/60 bg-white/25 px-3 py-2 text-aura-text-primary">
                  {privacy.retention}
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-aura-text-primary">Memory distribution</h2>
          </div>

          <div className="space-y-3">
            {summary.memory.categories.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/70 bg-white/25 p-4 text-sm text-aura-text-secondary">
                Save a few memories to see usage patterns by category.
              </div>
            ) : (
              summary.memory.categories.map((entry) => (
                <div key={entry.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-aura-text-secondary">
                    <span className="flex items-center gap-2"><Tag className="h-3.5 w-3.5" />{entry.category}</span>
                    <span>{entry.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/40">
                    <div className="h-full rounded-full bg-gradient-to-r from-aura-primary-purple to-aura-primary-pink" style={{ width: `${Math.max(entry.percent, 12)}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-aura-text-primary">Session overview</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/60 bg-white/25 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-aura-text-muted">Conversations</div>
              <div className="mt-2 text-2xl font-semibold text-aura-text-primary">{summary.conversations.total}</div>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/25 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-aura-text-muted">Messages</div>
              <div className="mt-2 text-2xl font-semibold text-aura-text-primary">{summary.conversations.messages}</div>
            </div>
            <div className="rounded-2xl border border-white/60 bg-white/25 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-aura-text-muted">Personality</div>
              <div className="mt-2 text-2xl font-semibold text-aura-text-primary">{privacy.personality || 'friendly'}</div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;
