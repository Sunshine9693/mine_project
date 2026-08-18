import test from 'node:test';
import assert from 'node:assert/strict';
import { getSpeechRecognitionCtor } from './useSpeechRecognition.js';

test('returns undefined when browser speech recognition is unsupported', () => {
  const SpeechRecognition = getSpeechRecognitionCtor();
  assert.equal(SpeechRecognition, undefined);
});
