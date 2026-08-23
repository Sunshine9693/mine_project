import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Search, Pin, Trash2, PencilLine, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import Toast from '../components/Toast';

const emptyForm = { title: '', content: '', tags: '', pinned: false };

const NotesPage = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadNotes = async (query = '') => {
    try {
      setLoading(true);
      const { data } = await api.get('/notes', { params: { search: query } });
      setNotes(data.notes || []);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return notes;
    return notes.filter((note) => {
      const haystack = `${note.title} ${note.content} ${(note.tags || []).join(' ')}`.toLowerCase();
      return haystack.includes(value);
    });
  }, [notes, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      pinned: form.pinned,
    };

    if (!payload.title) {
      setToastMessage('Note title is required');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/notes/${editingId}`, payload);
      } else {
        await api.post('/notes', payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadNotes(search);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to save note');
    }
  };

  const handleEdit = (note) => {
    setEditingId(note._id);
    setForm({
      title: note.title,
      content: note.content,
      tags: (note.tags || []).join(', '),
      pinned: note.pinned,
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notes/${id}`);
      await loadNotes(search);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to delete note');
    }
  };

  const togglePin = async (id) => {
    try {
      await api.patch(`/notes/${id}/pin`);
      await loadNotes(search);
    } catch (error) {
      setToastMessage(error.response?.data?.message || 'Unable to pin note');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-2rem)] select-none max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/dashboard')} className="p-3 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple border border-white/70 shadow-sm">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-semibold tracking-wide text-aura-text-primary">Notes</h2>
        <div className="w-12" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes"
                className="w-full rounded-full border border-white/60 bg-white/50 pl-9 pr-4 py-2.5 text-sm text-aura-text-primary outline-none"
              />
            </div>
            <PrimaryButton onClick={() => loadNotes(search)} className="px-4 py-2.5 text-sm">Search</PrimaryButton>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-aura-text-muted">Loading notes...</div>
          ) : filteredNotes.length ? (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <div key={note._id} className="rounded-2xl border border-white/60 bg-white/30 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {note.pinned && <Pin className="w-3.5 h-3.5 text-aura-primary-purple" />}
                        <h3 className="text-sm font-semibold text-aura-text-primary truncate">{note.title}</h3>
                      </div>
                      <p className="text-xs text-aura-text-secondary line-clamp-3 whitespace-pre-wrap">{note.content || 'No content yet.'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => togglePin(note._id)} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Pin/unpin note"><Pin className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(note)} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Edit note"><PencilLine className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(note._id)} className="p-2 rounded-full hover:bg-red-100 text-red-500" title="Delete note"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {(note.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {note.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full bg-aura-lavender/40 text-[10px] font-medium text-aura-soft-purple">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-aura-text-muted">No notes yet.</div>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-aura-text-primary">{editingId ? 'Edit note' : 'Create note'}</h3>
            {editingId && (
              <button onClick={() => { setEditingId(null); setForm(emptyForm); }} className="p-2 rounded-full hover:bg-white/50 text-aura-text-secondary" title="Cancel edit">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Note title"
              className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none"
            />
            <textarea
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="Write your note..."
              rows={6}
              className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none resize-none"
            />
            <input
              value={form.tags}
              onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
              placeholder="Tags (comma separated)"
              className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-aura-text-secondary">
              <input type="checkbox" checked={form.pinned} onChange={(event) => setForm((current) => ({ ...current, pinned: event.target.checked }))} />
              Pin this note
            </label>
            <PrimaryButton type="submit" className="w-full justify-center py-3 text-sm">
              <Plus className="w-4 h-4" />
              {editingId ? 'Update note' : 'Save note'}
            </PrimaryButton>
          </form>
        </GlassCard>
      </div>

      {toastMessage && <Toast message={toastMessage} type="error" onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default NotesPage;
