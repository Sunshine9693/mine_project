import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, LoaderCircle, Palette, UserRound, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const themeOptions = ['light', 'dark', 'system', 'lavender', 'rose', 'sage', 'midnight', 'warm'];

const profileDraft = (user) => ({
  name: user.name || '',
  email: user.email || '',
  avatar: user.avatar || '',
  birthday: user.birthday || '',
  timezone: user.timezone || 'Asia/Kolkata',
  preferences: {
    theme: user.preferences?.theme || 'light',
    accentColor: user.preferences?.accentColor || '#9B5DE5',
    sound: user.preferences?.sound !== false,
    reducedMotion: Boolean(user.preferences?.reducedMotion),
  },
  assistantSettings: {
    voice: user.assistantSettings?.voice || 'aura-default',
    speed: Number(user.assistantSettings?.speed ?? 1),
  },
});

const ProfilePanel = ({ onClose, reducedMotion = false }) => {
  const { setUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/me');
        const profile = data.user || data.data;
        if (!profile) throw new Error('Profile response was empty.');
        if (active) {
          setForm(profileDraft(profile));
          setUser(profile);
        }
      } catch (error) {
        if (active) {
          setMessage({
            type: 'error',
            text: error.response?.data?.message || 'Unable to load your profile. Please try again.',
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [setUser]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  const updateField = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateNestedField = (section, field, value) => {
    setForm((previous) => ({
      ...previous,
      [section]: { ...previous[section], [field]: value },
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form || saving) return;

    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.put('/users/me', {
        name: form.name,
        avatar: form.avatar,
        birthday: form.birthday,
        timezone: form.timezone,
        preferences: form.preferences,
        assistantSettings: form.assistantSettings,
      });
      const updatedUser = data.user || data.data;
      if (!updatedUser) throw new Error('Profile update response was empty.');
      setUser(updatedUser);
      setForm(profileDraft(updatedUser));
      setMessage({ type: 'success', text: 'Your profile changes have been saved.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Unable to save your profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'glass-input w-full rounded-xl px-3 py-2.5 text-sm text-aura-text-primary outline-none transition focus:border-aura-primary-purple/40 disabled:opacity-60';
  const labelClass = 'mb-1.5 block text-xs font-medium text-aura-text-muted';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/35 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        initial={reducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.18 }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) onClose();
        }}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-panel-title"
          className="glass-card w-full max-w-2xl overflow-hidden rounded-t-[28px] border border-white/70 shadow-2xl sm:rounded-[28px]"
          initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.99 }}
          transition={{ duration: reducedMotion ? 0 : 0.18 }}
        >
          <header className="flex items-center justify-between border-b border-aura-lavender/30 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 id="profile-panel-title" className="font-semibold text-aura-text-primary">Profile & Personalization</h2>
                <p className="text-xs text-aura-text-muted">Your profile and assistant preferences</p>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close profile" className="rounded-full p-2 text-aura-text-muted transition hover:bg-white/60 hover:text-aura-text-primary">
              <X className="h-4 w-4" />
            </button>
          </header>

          <form onSubmit={handleSubmit}>
            <div className="max-h-[min(72vh,680px)] space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              {message.text && (
                <div role="status" className={`rounded-xl border px-3 py-2.5 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                  {message.text}
                </div>
              )}

              {loading ? (
                <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-aura-text-muted" role="status">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading your profile…
                </div>
              ) : form ? (
                <>
                  <div className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/30 p-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-tr from-[#B88BE8] to-[#C58AF2] font-semibold text-white shadow-sm">
                      {form.avatar ? <img src={form.avatar} alt="" className="h-full w-full object-cover" /> : form.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <label className={labelClass} htmlFor="profile-avatar-url">Avatar URL</label>
                      <input
                        id="profile-avatar-url"
                        className={inputClass}
                        type="url"
                        maxLength={500}
                        value={form.avatar}
                        onChange={(event) => updateField('avatar', event.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <section>
                    <h3 className="mb-3 text-sm font-semibold text-aura-text-primary">Personal Information</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Name</span>
                        <input className={inputClass} value={form.name} onChange={(event) => updateField('name', event.target.value)} minLength={2} maxLength={80} required disabled={saving} />
                      </label>
                      <div>
                        <span className={labelClass}>Email</span>
                        <div className="rounded-xl border border-white/60 bg-white/30 px-3 py-2.5 text-sm text-aura-text-secondary">{form.email}</div>
                      </div>
                      <label>
                        <span className={labelClass}>Birthday</span>
                        <input className={inputClass} type="date" value={form.birthday} onChange={(event) => updateField('birthday', event.target.value)} disabled={saving} />
                      </label>
                      <label>
                        <span className={labelClass}>Timezone (IANA)</span>
                        <input className={inputClass} value={form.timezone} onChange={(event) => updateField('timezone', event.target.value)} placeholder="Asia/Kolkata" required disabled={saving} />
                      </label>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-aura-text-primary">
                      <Palette className="h-4 w-4 text-aura-primary-purple" />
                      Appearance
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Theme</span>
                        <select className={inputClass} value={form.preferences.theme} onChange={(event) => updateNestedField('preferences', 'theme', event.target.value)} disabled={saving}>
                          {themeOptions.map((theme) => <option key={theme} value={theme}>{theme[0].toUpperCase() + theme.slice(1)}</option>)}
                        </select>
                      </label>
                      <label>
                        <span className={labelClass}>Accent color</span>
                        <div className="flex h-[42px] items-center gap-3 rounded-xl border border-white/60 bg-white/30 px-3">
                          <input type="color" aria-label="Accent color" className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" value={form.preferences.accentColor} onChange={(event) => updateNestedField('preferences', 'accentColor', event.target.value)} disabled={saving} />
                          <span className="text-sm text-aura-text-secondary">{form.preferences.accentColor}</span>
                        </div>
                      </label>
                      <label className="flex items-center justify-between rounded-xl border border-white/60 bg-white/30 px-3 py-2.5 text-sm text-aura-text-primary">
                        Sound effects
                        <input type="checkbox" className="h-4 w-4 accent-aura-primary-purple" checked={form.preferences.sound} onChange={(event) => updateNestedField('preferences', 'sound', event.target.checked)} disabled={saving} />
                      </label>
                      <label className="flex items-center justify-between rounded-xl border border-white/60 bg-white/30 px-3 py-2.5 text-sm text-aura-text-primary">
                        Reduce motion
                        <input type="checkbox" className="h-4 w-4 accent-aura-primary-purple" checked={form.preferences.reducedMotion} onChange={(event) => updateNestedField('preferences', 'reducedMotion', event.target.checked)} disabled={saving} />
                      </label>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-3 text-sm font-semibold text-aura-text-primary">Assistant Preferences</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Voice</span>
                        <select className={inputClass} value={form.assistantSettings.voice} onChange={(event) => updateNestedField('assistantSettings', 'voice', event.target.value)} disabled={saving}>
                          <option value="aura-default">AURA Default</option>
                          <option value="female-1">Female</option>
                          <option value="male-1">Male</option>
                        </select>
                      </label>
                      <label>
                        <span className={labelClass}>Speech speed · {form.assistantSettings.speed.toFixed(1)}×</span>
                        <input type="range" min="0.5" max="2" step="0.1" className="mt-2 w-full accent-aura-primary-purple" value={form.assistantSettings.speed} onChange={(event) => updateNestedField('assistantSettings', 'speed', Number(event.target.value))} disabled={saving} />
                      </label>
                    </div>
                  </section>
                </>
              ) : null}
            </div>

            <footer className="flex justify-end gap-2 border-t border-aura-lavender/30 px-5 py-4 sm:px-6">
              <button type="button" onClick={onClose} className="rounded-full border border-white/70 bg-white/40 px-4 py-2 text-sm font-medium text-aura-text-secondary transition hover:bg-white/60" disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-aura-primary-purple to-aura-soft-purple px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60" disabled={loading || saving || !form}>
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </footer>
          </form>
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfilePanel;
