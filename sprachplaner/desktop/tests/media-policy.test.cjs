const test = require('node:test');
const assert = require('node:assert/strict');
const { allowAudioRequest, allowAudioCheck } = require('../media-policy.cjs');
const page = 'sprachplaner://app/index.html';
test('Only the planner can request audio; camera and other origins remain denied', () => {
  assert.equal(allowAudioRequest(page, 'media', { requestingUrl: page, mediaTypes: ['audio'] }), true);
  for (const types of [[], ['video'], ['audio', 'video']]) assert.equal(allowAudioRequest(page, 'media', { requestingUrl: page, mediaTypes: types }), false);
  assert.equal(allowAudioRequest(page, 'notifications', { requestingUrl: page, mediaTypes: ['audio'] }), false);
  assert.equal(allowAudioRequest(page, 'media', { requestingUrl: 'https://evil.example/', mediaTypes: ['audio'] }), false);
  assert.equal(allowAudioRequest('sprachplaner://evil/index.html', 'media', { requestingUrl: page, mediaTypes: ['audio'] }), false);
  assert.equal(allowAudioCheck(page, 'media', 'sprachplaner://app', { mediaType: 'audio' }), true);
  assert.equal(allowAudioCheck(page, 'media', 'sprachplaner://app', { mediaType: 'video' }), false);
  assert.equal(allowAudioCheck(page, 'media', 'https://evil.example', { mediaType: 'audio' }), false);
});
