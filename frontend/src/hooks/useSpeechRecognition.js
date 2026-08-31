import { useEffect, useMemo, useRef, useState } from 'react';

export const getSpeechRecognitionCtor = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || undefined;
};

export const getSpeechRecognitionErrorMessage = (error, { secureContext = typeof window === 'undefined' ? true : window.isSecureContext } = {}) => {
  if (!secureContext) {
    return 'Voice recognition requires localhost or HTTPS. You can still type your message.';
  }

  switch (error) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is required for voice commands.';
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'I could not access your microphone.';
    case 'network':
      return 'Voice recognition service is unavailable in this browser. Please try Chrome or Edge and allow microphone access.';
    default:
      return 'I could not understand that. Please try again.';
  }
};

export const useSpeechRecognition = ({ lang = 'en-US', continuous = false, silenceTimeout = 8000 } = {}) => {
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [permissionState, setPermissionState] = useState('PERMISSION_PENDING');

  const SpeechRecognitionCtor = useMemo(() => getSpeechRecognitionCtor(), []);
  const supported = Boolean(SpeechRecognitionCtor);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setPermissionState('NOT_SUPPORTED');
      setError(getSpeechRecognitionErrorMessage('network', { secureContext: false }));
      return undefined;
    }

    if (!SpeechRecognitionCtor) {
      setPermissionState('NOT_SUPPORTED');
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
      setPermissionState('PERMISSION_GRANTED');
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
        setError('No speech detected. Please try again.');
      }, silenceTimeout);
    };

    recognition.onresult = (event) => {
      let nextFinalTranscript = '';
      let nextInterimTranscript = '';

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript || '';

        if (result.isFinal) {
          nextFinalTranscript += text;
        } else {
          nextInterimTranscript += text;
        }
      }

      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = setTimeout(() => {
        recognition.stop();
      }, silenceTimeout);
      setFinalTranscript(nextFinalTranscript.trim());
      setInterimTranscript(nextInterimTranscript.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      const message = event?.error || 'Speech recognition error';
      clearTimeout(silenceTimerRef.current);
      if (message === 'not-allowed' || message === 'service-not-allowed') {
        setPermissionState('PERMISSION_DENIED');
        setError(getSpeechRecognitionErrorMessage(message));
      } else if (message === 'no-speech') {
        setError(getSpeechRecognitionErrorMessage(message));
      } else if (message === 'audio-capture') {
        setError(getSpeechRecognitionErrorMessage(message));
      } else if (message === 'network') {
        setError(getSpeechRecognitionErrorMessage(message));
      } else {
        setError(getSpeechRecognitionErrorMessage(message));
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      clearTimeout(silenceTimerRef.current);
    };

    recognitionRef.current = recognition;

    return () => {
      clearTimeout(silenceTimerRef.current);
      recognition.abort();
    };
  }, [SpeechRecognitionCtor, continuous, lang, silenceTimeout]);

  const startListening = () => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setError(getSpeechRecognitionErrorMessage('network', { secureContext: false }));
      return false;
    }

    if (!SpeechRecognitionCtor) {
      setError('Voice recognition is not supported in this browser. You can still type your message.');
      return false;
    }

    try {
      setFinalTranscript('');
      setInterimTranscript('');
      setPermissionState('PERMISSION_PENDING');
      recognitionRef.current?.start();
      return true;
    } catch {
      setIsListening(false);
      setError('The microphone is already active. Please try again in a moment.');
      return false;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    clearTimeout(silenceTimerRef.current);
    setIsListening(false);
  };

  const resetTranscript = () => {
    setFinalTranscript('');
    setInterimTranscript('');
    setError('');
  };

  return {
    transcript: `${finalTranscript} ${interimTranscript}`.trim(),
    finalTranscript,
    interimTranscript,
    isListening,
    error,
    supported,
    permissionState,
    startListening,
    stopListening,
    resetTranscript,
  };
};
