import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, BellRing, Trash2, PencilLine, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Toast from '../components/Toast';

const emptyForm = { title: '', description: '', date: '', time: '', priority: 'MEDIUM', enabled: true };

const RemindersPage = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadReminders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reminders');
      setReminders(data.reminders || []);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const upcoming = useMemo(() => reminders.filter((reminder) => !reminder.completed && reminder.enabled), [reminders]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      time: form.time,
      priority: form.priority,
      enabled: form.enabled,
    };

    if (!payload.title) {
      setToastMessage('Reminder title is required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/reminders/${editingId}`, payload);
      } else {
        await api.post('/reminders', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadReminders();
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to save reminder');
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder._id);
    setForm({
      title: reminder.title,
      description: reminder.description || '',
      date: reminder.date || '',
      time: reminder.time || '',
      priority: reminder.priority,
      enabled: reminder.enabled,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      await loadReminders();
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to delete reminder');
    }
  };

  const toggleComplete = async (id) => {
    try {
      await api.patch(`/reminders/${id}/complete`);
      await loadReminders();
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to update reminder');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] select-none max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-3 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple border border-white/70 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold tracking-wide text-aura-text-primary">Reminders</h2>
        <div className="w-12" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-5">
          {loading ? (
            <div className="py-8 text-center text-sm text-aura-text-muted">Loading reminders...</div>
          ) : upcoming.length ? (
            <div className="space-y-3">
              {upcoming.map((reminder) => (
                <div key={reminder._id} className={`rounded-2xl border p-4 ${reminder.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-white/60 bg-white/30'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4 text-aura-primary-purple" />
                        <h3 className="text-sm font-semibold text-aura-text-primary">{reminder.title}</h3>
                      </div>
                      {reminder.description && <p className="text-xs text-aura-text-secondary mt-2 whitespace-pre-wrap">{reminder.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
                        <span className="px-2 py-1 rounded-full bg-aura-lavender/40 text-aura-soft-purple">{reminder.priority}</span>
                        {reminder.date && <span className="px-2 py-1 rounded-full bg-white/60 text-aura-text-secondary">{reminder.date}</span>}
                        {reminder.time && <span className="px-2 py-1 rounded-full bg-white/60 text-aura-text-secondary">{reminder.time}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleComplete(reminder._id)} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Complete reminder"><CheckCircle2 className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(reminder)} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Edit reminder"><PencilLine className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(reminder._id)} className="p-2 rounded-full hover:bg-red-100 text-red-500" title="Delete reminder"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-aura-text-muted">No upcoming reminders.</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-aura-text-primary">{editingId ? 'Edit reminder' : 'Create reminder'}</h3>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); }} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Cancel edit">x</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Reminder title" className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none" />
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={4} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none" />
              <input type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <label className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm text-aura-text-secondary">
                <input type="checkbox" checked={form.enabled} onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))} />
                Enabled
              </label>
            </div>
            <PrimaryButton type="submit" className="w-full justify-center py-3 text-sm">
              <Plus className="w-4 h-4" />
              {editingId ? 'Update reminder' : 'Save reminder'}
            </PrimaryButton>
          </form>
        </GlassCard>
      </div>

      {toastMessage && <Toast message={toastMessage} type="error" onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default RemindersPage;
