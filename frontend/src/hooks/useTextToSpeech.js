import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'aura-voice-settings';

const defaultSettings = {
  voiceName: '',
  rate: 1,
  pitch: 1,
  volume: 1,
  autoSpeak: true,
};

const getStoredSettings = () => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const pickPreferredVoice = (nextVoices) => {
  if (!nextVoices.length) {
    return '';
  }

  const femaleMatches = nextVoices.filter((voice) => {
    const name = (voice.name || '').toLowerCase();
    return (
      name.includes('female') ||
      name.includes('woman') ||
      name.includes('zira') ||
      name.includes('samantha') ||
      name.includes('susan') ||
      name.includes('aria') ||
      name.includes('victoria') ||
      name.includes('jenny') ||
      name.includes('jenny') ||
      name.includes('samantha') ||
      name.includes('zira')
    );
  });

  if (femaleMatches.length) {
    return femaleMatches[0].name;
  }

  return nextVoices[0].name;
};

export const toSpeechText = (text) => String(text || '')
  .replace(/```[\s\S]*?```/g, 'Code block omitted.')
  .replace(/`([^`]+)`/g, '$1')
  .replace(/https?:\/\/\S+/g, 'link')
  .replace(/^\s{0,3}#{1,6}\s*/gm, '')
  .replace(/[*_~]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export const useTextToSpeech = () => {
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState(defaultSettings.voiceName);
  const [rate, setRate] = useState(defaultSettings.rate);
  const [pitch, setPitch] = useState(defaultSettings.pitch);
  const [volume, setVolume] = useState(defaultSettings.volume);
  const [autoSpeak, setAutoSpeak] = useState(defaultSettings.autoSpeak);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const selectedVoice = useMemo(
    () => voices.find((voice) => voice.name === selectedVoiceName) || voices[0] || null,
    [selectedVoiceName, voices],
  );

  useEffect(() => {
    const settings = getStoredSettings();
    setSelectedVoiceName(settings.voiceName || '');
    setRate(settings.rate || 1);
    setPitch(settings.pitch || 1);
    setVolume(settings.volume ?? 1);
    setAutoSpeak(settings.autoSpeak ?? true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncVoices = () => {
      const nextVoices = window.speechSynthesis?.getVoices?.() || [];
      setVoices(nextVoices);

      if (!selectedVoiceName && nextVoices.length > 0) {
        setSelectedVoiceName(pickPreferredVoice(nextVoices));
      }
    };

    syncVoices();
    window.speechSynthesis?.addEventListener?.('voiceschanged', syncVoices);

    return () => {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', syncVoices);
    };
  }, [selectedVoiceName]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        voiceName: selectedVoiceName,
        rate,
        pitch,
        volume,
        autoSpeak,
      }),
    );
  }, [selectedVoiceName, rate, pitch, volume, autoSpeak]);

  useEffect(() => () => {
    window.speechSynthesis?.cancel?.();
  }, []);

  const speak = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    window.speechSynthesis.cancel();

    const cleanText = toSpeechText(text);
    if (!cleanText) return false;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = selectedVoice || null;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  };

  const pause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resume = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stop = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return {
    voices,
    selectedVoice,
    setVoice: setSelectedVoiceName,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    autoSpeak,
    setAutoSpeak,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    stop,
  };
};
