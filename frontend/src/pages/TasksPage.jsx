import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Search, CheckCircle2, Trash2, PencilLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Toast from '../components/Toast';

const emptyForm = { title: '', description: '', priority: 'MEDIUM', dueDate: '', category: 'General' };

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tasks', { params: { status: statusFilter === 'all' ? undefined : statusFilter } });
      setTasks(data.tasks || []);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [statusFilter]);

  const filteredTasks = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return tasks;
    return tasks.filter((task) => `${task.title} ${task.description} ${task.category}`.toLowerCase().includes(value));
  }, [tasks, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate || null,
      category: form.category.trim() || 'General',
    };

    if (!payload.title) {
      setToastMessage('Task title is required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadTasks();
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      category: task.category || 'General',
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      await loadTasks();
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to delete task');
    }
  };

  const toggleComplete = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      await loadTasks();
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to update task');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] select-none max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-3 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple border border-white/70 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold tracking-wide text-aura-text-primary">Tasks</h2>
        <div className="w-12" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-5">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks"
                className="w-full rounded-full border border-white/60 bg-white/50 pl-9 pr-4 py-2.5 text-sm text-aura-text-primary outline-none"
              />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-full border border-white/60 bg-white/50 px-3 py-2.5 text-sm text-aura-text-primary outline-none">
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-aura-text-muted">Loading tasks...</div>
          ) : filteredTasks.length ? (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div key={task._id} className={`rounded-2xl border p-4 ${task.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-white/60 bg-white/30'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleComplete(task._id)} className={`rounded-full p-1 ${task.completed ? 'bg-emerald-500 text-white' : 'bg-white/60 text-aura-text-secondary'}`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <h3 className={`text-sm font-semibold ${task.completed ? 'line-through text-aura-text-muted' : 'text-aura-text-primary'}`}>{task.title}</h3>
                      </div>
                      {task.description && <p className="text-xs text-aura-text-secondary mt-2 whitespace-pre-wrap">{task.description}</p>}
                      <div className="flex flex-wrap gap-2 mt-3 text-[10px]">
                        <span className="px-2 py-1 rounded-full bg-aura-lavender/40 text-aura-soft-purple">{task.priority}</span>
                        <span className="px-2 py-1 rounded-full bg-white/60 text-aura-text-secondary">{task.category}</span>
                        {task.dueDate && <span className="px-2 py-1 rounded-full bg-white/60 text-aura-text-secondary">{new Date(task.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(task)} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Edit task"><PencilLine className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(task._id)} className="p-2 rounded-full hover:bg-red-100 text-red-500" title="Delete task"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-aura-text-muted">No pending tasks.</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-aura-text-primary">{editingId ? 'Edit task' : 'Create task'}</h3>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); }} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Cancel edit">x</button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Task title" className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none" />
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" rows={4} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none resize-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none" />
            </div>
            <input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none" />
            <PrimaryButton type="submit" className="w-full justify-center py-3 text-sm">
              <Plus className="w-4 h-4" />
              {editingId ? 'Update task' : 'Save task'}
            </PrimaryButton>
          </form>
        </GlassCard>
      </div>

      {toastMessage && <Toast message={toastMessage} type="error" onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default TasksPage;
