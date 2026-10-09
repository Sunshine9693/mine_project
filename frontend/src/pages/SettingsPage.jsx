import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserRound,
  Palette,
  Mic,
  Sparkles,
  ShieldCheck,
  Save,
  RefreshCcw,
} from 'lucide-react';
import PrimaryButton from '../components/PrimaryButton';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const defaultProfile = (user = {}) => ({
  name: user.name || '',
  displayName: user.displayName || user.name || '',
  email: user.email || '',
  bio: user.bio || '',
  birthday: user.birthday || '',
  timezone: user.timezone || 'Asia/Kolkata',
  language: user.language || 'en',
  country: user.country || 'India',
  preferences: {
    theme: user.preferences?.theme || 'light',
    accentColor: user.preferences?.accentColor || '#9B5DE5',
    reducedMotion: Boolean(user.preferences?.reducedMotion),
    sound: user.preferences?.sound !== false,
  },
  assistantSettings: {
    voice: user.assistantSettings?.voice || 'aura-default',
    speed: Number(user.assistantSettings?.speed ?? 1),
    autoSpeak: Boolean(user.assistantSettings?.autoSpeak),
    assistantName: user.assistantSettings?.assistantName || 'AURA',
    responseStyle: user.assistantSettings?.responseStyle || 'friendly',
    recognitionLanguage: user.assistantSettings?.recognitionLanguage || 'en-US',
  },
});

const themeOptions = ['light', 'dark', 'system', 'lavender', 'rose', 'sage', 'midnight', 'warm'];
const responseStyles = ['friendly', 'professional', 'concise', 'detailed'];

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(defaultProfile(user));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    setForm(defaultProfile(user));
  }, [user]);

  const summary = useMemo(() => ({
    preferredName: form.displayName || form.name || 'AURA User',
    theme: form.preferences.theme,
    voice: form.assistantSettings.voice,
  }), [form]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePreference = (field, value) => {
    setForm((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const updateAssistant = (field, value) => {
    setForm((prev) => ({
      ...prev,
      assistantSettings: {
        ...prev.assistantSettings,
        [field]: value,
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: 'idle', message: '' });

    try {
      const payload = {
        name: form.name,
        displayName: form.displayName,
        bio: form.bio,
        birthday: form.birthday,
        timezone: form.timezone,
        language: form.language,
        country: form.country,
        preferences: form.preferences,
        assistantSettings: form.assistantSettings,
      };

      const response = await api.put('/users/me', payload);
      const nextUser = response.data.user || response.data.data || user;
      setUser(nextUser);
      setStatus({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to save changes right now.';
      setStatus({ type: 'error', message });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setForm(defaultProfile(user));
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-2rem)] py-6 px-4 md:px-6 select-none">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-aura-text-muted">Personalization</p>
            <h1 className="mt-2 text-3xl font-semibold text-aura-text-primary">Profile & Settings</h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/40 px-4 py-2 text-sm font-medium text-aura-text-secondary transition hover:bg-white/60"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
            <PrimaryButton onClick={handleSave} disabled={saving} icon={<Save className="h-4 w-4" />}>
              {saving ? 'Saving...' : 'Save Changes'}
            </PrimaryButton>
          </div>
        </div>

        {status.message ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
            {status.message}
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSave}>
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-6">
              <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-aura-text-primary">Profile</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Full name</span>
                    <input
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-aura-primary-purple/40"
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Preferred name</span>
                    <input
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-aura-primary-purple/40"
                      value={form.displayName}
                      onChange={(e) => updateField('displayName', e.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Email</span>
                    <input
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.email}
                      disabled
                    />
                  </label>

                  <label className="space-y-2 md:col-span-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Bio</span>
                    <textarea
                      rows="4"
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition focus:border-aura-primary-purple/40"
                      value={form.bio}
                      onChange={(e) => updateField('bio', e.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Birthday</span>
                    <input
                      type="date"
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.birthday}
                      onChange={(e) => updateField('birthday', e.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Timezone</span>
                    <select
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.timezone}
                      onChange={(e) => updateField('timezone', e.target.value)}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Language</span>
                    <select
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.language}
                      onChange={(e) => updateField('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Country</span>
                    <input
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.country}
                      onChange={(e) => updateField('country', e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                    <Palette className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-aura-text-primary">Appearance</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Theme</span>
                    <select
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.preferences.theme}
                      onChange={(e) => updatePreference('theme', e.target.value)}
                    >
                      {themeOptions.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Accent color</span>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/35 px-3 py-2">
                      <input
                        type="color"
                        className="h-10 w-14 rounded-lg border-0 bg-transparent"
                        value={form.preferences.accentColor}
                        onChange={(e) => updatePreference('accentColor', e.target.value)}
                      />
                      <span className="text-sm text-aura-text-secondary">{form.preferences.accentColor}</span>
                    </div>
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/30 px-4 py-3">
                    <span className="text-sm font-medium text-aura-text-primary">Reduce motion</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-aura-primary-purple"
                      checked={form.preferences.reducedMotion}
                      onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/30 px-4 py-3">
                    <span className="text-sm font-medium text-aura-text-primary">Sound effects</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-aura-primary-purple"
                      checked={form.preferences.sound}
                      onChange={(e) => updatePreference('sound', e.target.checked)}
                    />
                  </label>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                    <Mic className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-aura-text-primary">Voice</h2>
                </div>

                <div className="space-y-4">
                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Voice</span>
                    <select
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.assistantSettings.voice}
                      onChange={(e) => updateAssistant('voice', e.target.value)}
                    >
                      <option value="aura-default">AURA Default</option>
                      <option value="female-1">Female</option>
                      <option value="male-1">Male</option>
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Speed</span>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      className="w-full accent-aura-primary-purple"
                      value={form.assistantSettings.speed}
                      onChange={(e) => updateAssistant('speed', Number(e.target.value))}
                    />
                    <div className="text-sm text-aura-text-secondary">{form.assistantSettings.speed.toFixed(1)}x</div>
                  </label>

                  <label className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/30 px-4 py-3">
                    <span className="text-sm font-medium text-aura-text-primary">Auto speak</span>
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-aura-primary-purple"
                      checked={form.assistantSettings.autoSpeak}
                      onChange={(e) => updateAssistant('autoSpeak', e.target.checked)}
                    />
                  </label>
                </div>
              </section>

              <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-aura-text-primary">Assistant</h2>
                </div>

                <div className="space-y-4">
                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Assistant name</span>
                    <input
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.assistantSettings.assistantName}
                      onChange={(e) => updateAssistant('assistantName', e.target.value)}
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Response style</span>
                    <select
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.assistantSettings.responseStyle}
                      onChange={(e) => updateAssistant('responseStyle', e.target.value)}
                    >
                      {responseStyles.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-aura-text-muted">Recognition language</span>
                    <input
                      className="glass-input w-full rounded-2xl px-4 py-3 text-sm text-aura-text-primary outline-none transition"
                      value={form.assistantSettings.recognitionLanguage}
                      onChange={(e) => updateAssistant('recognitionLanguage', e.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="glass-card rounded-[28px] border border-white/60 p-5 md:p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl bg-aura-lavender/60 p-2 text-aura-primary-purple">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-aura-text-primary">Memory & Privacy</h2>
                </div>

                <div className="space-y-3 text-sm text-aura-text-secondary">
                  <div className="rounded-2xl border border-white/60 bg-white/30 p-3">
                    <strong className="text-aura-text-primary">Preferred name:</strong> {summary.preferredName}
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/30 p-3">
                    <strong className="text-aura-text-primary">Theme:</strong> {summary.theme}
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/30 p-3">
                    <strong className="text-aura-text-primary">Voice:</strong> {summary.voice}
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/30 p-3 text-aura-text-primary">
                    AURA stores only the information needed for personalization and never exposes stored API keys to the frontend.
                  </div>
                </div>
              </section>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
