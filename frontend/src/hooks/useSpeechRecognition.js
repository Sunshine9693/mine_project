import { useEffect, useMemo, useRef, useState } from 'react';

export const getSpeechRecognitionCtor = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || undefined;
};

export const useSpeechRecognition = ({ lang = 'en-US', continuous = false } = {}) => {
  const recognitionRef = useRef(null);
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');

  const SpeechRecognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const supported = Boolean(SpeechRecognitionCtor);

  useEffect(() => {
    if (!SpeechRecognitionCtor) {
      setError('Voice recognition is not supported in this browser. You can still type your message.');
      return undefined;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      setError('');
    };

    recognition.onresult = (event) => {
      let nextTranscript = '';

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript || '';

        if (result.isFinal) {
          nextTranscript += text;
        } else {
          nextTranscript += text;
        }
      }

      setTranscript(nextTranscript.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const message = event?.error || 'Speech recognition error';
      setError(message === 'not-allowed' ? 'Microphone access was blocked. Please allow mic access and try again.' : `Voice recognition error: ${message}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [SpeechRecognitionCtor, continuous, lang]);

  const startListening = () => {
    if (!SpeechRecognitionCtor) {
      setError('Voice recognition is not supported in this browser. You can still type your message.');
      return false;
    }

    try {
      setTranscript('');
      recognitionRef.current?.start();
      return true;
    } catch (event) {
      setIsListening(false);
      setError('The microphone is already active. Please try again in a moment.');
      return false;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const resetTranscript = () => {
    setTranscript('');
    setError('');
  };

  return {
    transcript,
    isListening,
    error,
    supported,
    startListening,
    stopListening,
    resetTranscript,
  };
};
