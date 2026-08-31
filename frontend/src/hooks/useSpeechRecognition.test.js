import test from 'node:test';
import assert from 'node:assert/strict';
import { getSpeechRecognitionCtor, getSpeechRecognitionErrorMessage } from './useSpeechRecognition.js';

test('returns undefined when browser speech recognition is unsupported', () => {
  const SpeechRecognition = getSpeechRecognitionCtor();
  assert.equal(SpeechRecognition, undefined);
});

test('provides clearer guidance for insecure or unavailable speech recognition', () => {
  assert.match(
    getSpeechRecognitionErrorMessage('network', { secureContext: false }),
    /localhost|HTTPS|type your message/i
  );
  assert.match(
    getSpeechRecognitionErrorMessage('network', { secureContext: true }),
    /Chrome|Edge|microphone/i
  );
});
