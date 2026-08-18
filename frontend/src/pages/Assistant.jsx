import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '../components/VoiceOrb';
import VoiceControls from '../components/VoiceControls';
import Toast from '../components/Toast';
import api from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

const Assistant = () => {
  const navigate = useNavigate();
  const [orbState, setOrbState] = useState('idle');
  const [speechText, setSpeechText] = useState("I'm Sunshine, here to help you think clearly and move fast.");
  const [toastMessage, setToastMessage] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const {
    transcript,
    isListening,
    error,
    supported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({ lang: 'en-US', continuous: false });

  const {
    voices,
    selectedVoice,
    setVoice,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    autoSpeak,
    setAutoSpeak,
    speak,
    stop,
  } = useTextToSpeech();

  const currentStateLabel = useMemo(() => {
    if (!supported) return 'unsupported';
    if (isListening) return 'listening';
    if (orbState === 'thinking') return 'thinking';
    if (orbState === 'speaking') return 'speaking';
    if (orbState === 'error') return 'error';
    return 'idle';
  }, [isListening, orbState, supported]);

  const sendMessageToAI = async (nextText) => {
    const trimmed = String(nextText || '').trim();
    if (!trimmed || isSending) {
      return;
    }

    setIsSending(true);
    setOrbState('thinking');
    setSpeechText(trimmed);

    try {
      const { data } = await api.post('/ai/chat', {
        message: trimmed,
        conversationId,
      });

      const nextConversationId = data.conversationId || conversationId;
      if (nextConversationId) {
        setConversationId(nextConversationId);
      }

      setOrbState('speaking');
      setSpeechText(data.response || 'I am here to help.');

      if (soundEnabled && autoSpeak && data.response) {
        speak(data.response);
      }

      setToastMessage(data.action ? `Action detected: ${data.action}` : 'Response received');
    } catch (err) {
      console.error('[AURA Assistant Chat Error]:', err);
      setOrbState('error');
      setSpeechText(err.response?.data?.message || 'I hit a connection issue. Please try again.');
      setToastMessage('AI request failed');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (!supported) {
      setOrbState('error');
      setSpeechText('Voice recognition is not supported in this browser. You can still type your message.');
      return;
    }

    if (isListening) {
      setOrbState('listening');
      setSpeechText('I\'m listening. Say something...');
      return;
    }

    if (transcript) {
      const text = transcript.trim();
      if (text) {
        sendMessageToAI(text);
      }
      return;
    }

    if (error) {
      setOrbState('error');
      setSpeechText(error);
    }
  }, [transcript, isListening, error, supported, soundEnabled, autoSpeak, speak, conversationId, isSending]);

  useEffect(() => {
    if (orbState === 'speaking') {
      const speakingTimer = setTimeout(() => {
        setOrbState('idle');
      }, 4000);

      return () => clearTimeout(speakingTimer);
    }

    return undefined;
  }, [orbState]);

  const handleToggleMic = () => {
    if (!supported) {
      setOrbState('error');
      setSpeechText('Voice recognition is not supported in this browser. You can still type your message.');
      return;
    }

    if (isListening) {
      stopListening();
      setOrbState('idle');
      return;
    }

    setSpeechText('I\'m listening. Say something...');
    setOrbState('listening');
    resetTranscript();
    startListening();
  };

  const handleToggleChat = () => {
    setToastMessage('Text interface is enabled on the Dashboard!');
  };

  const handleClear = () => {
    stop();
    stopListening();
    resetTranscript();
    setOrbState('idle');
    setSpeechText('Transcript and voice cache cleared. Ask me anything.');
    setToastMessage('Session cleared');
  };

  const triggerErrorState = () => {
    setOrbState('error');
    setSpeechText('An unexpected network interruption occurred. Please try again.');
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center min-h-[calc(100vh-2rem)] py-4 select-none max-w-2xl mx-auto w-full">
      <div className="w-full flex items-center justify-between px-2">
        <motion.button
          whileHover={{ scale: 1.05, x: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="p-3 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple border border-white/70 shadow-sm focus:outline-none"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>

        <h2 className="text-base font-semibold tracking-wide text-aura-text-primary">
          Sunshine
        </h2>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple border border-white/70 shadow-sm focus:outline-none"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSettingsOpen((prev) => !prev)}
            className="p-3 rounded-full glass-card text-aura-text-secondary hover:text-aura-primary-purple border border-white/70 shadow-sm focus:outline-none"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center my-6 w-full px-6">
        <VoiceOrb state={currentStateLabel} size="lg" />

        <div className="mt-12 w-full max-w-lg min-h-[120px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={speechText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-[26px] p-6 text-center text-sm md:text-base text-aura-text-secondary leading-relaxed border border-white/60 shadow-[0_10px_35px_rgba(120,80,160,0.04)] w-full"
            >
              {speechText}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {settingsOpen && (
        <div className="w-full max-w-lg mb-4 p-4 glass-card rounded-[24px] border border-white/60">
          <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-aura-text-muted">
            Voice Settings
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-aura-text-secondary mb-2">
                Voice
              </label>
              <select
                value={selectedVoice?.name || ''}
                onChange={(event) => setVoice(event.target.value)}
                className="w-full rounded-2xl border border-white/60 bg-white/45 px-3 py-2.5 text-sm text-aura-text-primary outline-none"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-aura-text-secondary">
                Speed
                <input type="range" min="0.5" max="1.8" step="0.1" value={rate} onChange={(event) => setRate(Number(event.target.value))} className="mt-2 w-full" />
              </label>

              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-aura-text-secondary">
                Pitch
                <input type="range" min="0.5" max="2" step="0.1" value={pitch} onChange={(event) => setPitch(Number(event.target.value))} className="mt-2 w-full" />
              </label>

              <label className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-aura-text-secondary">
                Volume
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="mt-2 w-full" />
              </label>
            </div>

            <label className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/30 px-3 py-2 text-xs text-aura-text-primary">
              <span>Auto-speak</span>
              <input type="checkbox" checked={autoSpeak} onChange={(event) => setAutoSpeak(event.target.checked)} className="h-4 w-4 accent-aura-primary-purple" />
            </label>
          </div>
        </div>
      )}

      {!supported && (
        <div className="mb-4 w-full max-w-lg rounded-[24px] border border-red-200 bg-red-50/80 px-4 py-3 text-center text-xs text-red-600">
          Voice recognition is not supported in this browser. You can still type your message.
        </div>
      )}

      <div className="w-full pb-4">
        <VoiceControls
          isListening={isListening}
          onToggleMic={handleToggleMic}
          onToggleChat={handleToggleChat}
          onClear={handleClear}
        />
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="info"
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
};

export default Assistant;
