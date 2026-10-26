const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const code = readFileSync(require('node:path').join(__dirname, '../speech.js'), 'utf8');
function harness(options = {}) {
  const modelEvents = {}, events = {}, result = { ready: 0, tracksStopped: 0, removed: 0, finalized: 0, results: [], partials: [], errors: [] };
  const stream = { getTracks: () => [{ stop: () => result.tracksStopped++ }] };
  class Recognizer {
    on(name, callback) { events[name] = callback; }
    acceptWaveform() {}
    retrieveFinalResult() { result.finalized++; }
    remove() { result.removed++; }
  }
  class Model {
    KaldiRecognizer = Recognizer;
    on(name, callback) { modelEvents[name] = callback; }
    terminate() {}
  }
  class Context {
    sampleRate = 16000;
    state = 'running';
    destination = {};
    createMediaStreamSource() { return { connect() {}, disconnect() {} }; }
    createScriptProcessor() { result.processor = { connect() {}, disconnect() {}, onaudioprocess: null }; return result.processor; }
    async resume() {}
    async close() { this.state = 'closed'; }
  }
  const window = {};
  vm.runInNewContext(code, {
    window, location: { href: 'sprachplaner://app/index.html' }, URL, Vosk: { Model }, AudioContext: Context,
    navigator: { mediaDevices: { getUserMedia: options.getMedia || (async () => stream) } },
    setTimeout, clearTimeout, console, Error,
  });
  const session = window.SprachplanerSpeech.create({
    onReady: () => result.ready++, onPartial: text => result.partials.push(text),
    onResult: text => result.results.push(text), onError: error => result.errors.push(error),
  });
  return { session, result, stream, loaded: () => modelEvents.load({ result: true }), emit: (event, value) => events[event]?.(value) };
}
test('Stop drains all queued audio and waits for the final words before releasing the recognizer', async () => {
  const h = harness();
  const starting = h.session.start(); h.loaded(); await starting;
  h.result.processor.onaudioprocess({ inputBuffer: {} });
  h.result.processor.onaudioprocess({ inputBuffer: {} });
  const stopping = h.session.stop();
  assert.equal(h.result.tracksStopped, 1);
  assert.equal(h.result.finalized, 0);
  h.emit('partialresult', { result: { partial: 'morgen' } });
  await Promise.resolve(); assert.equal(h.result.finalized, 0);
  h.emit('partialresult', { result: { partial: 'morgen fünfzehn uhr' } });
  await Promise.resolve(); assert.equal(h.result.finalized, 1);
  h.emit('result', { result: { text: 'morgen fünfzehn uhr zahnarzt' } });
  await stopping;
  assert.deepEqual(h.result.results, ['morgen fünfzehn uhr zahnarzt']);
  assert.equal(h.result.removed, 1);
  h.emit('result', { result: { text: 'stale result' } });
  assert.equal(h.result.results.length, 1);
});
test('Cancel while the model loads never opens the microphone', async () => {
  let requested = false;
  const h = harness({ getMedia: async () => { requested = true; } });
  const starting = h.session.start(); h.session.abort(); h.loaded(); await starting;
  assert.equal(requested, false); assert.equal(h.result.ready, 0);
});
test('Cancel during a pending microphone request releases a late microphone stream', async () => {
  let grant;
  const h = harness({ getMedia: () => new Promise(resolve => { grant = resolve; }) });
  const starting = h.session.start(); h.loaded(); await Promise.resolve();
  h.session.abort(); grant(h.stream); await starting;
  assert.equal(h.result.tracksStopped, 1); assert.equal(h.result.ready, 0);
});
test('Denied microphone produces an actionable error, without starting recording', async () => {
  const h = harness({ getMedia: async () => { throw { name: 'NotAllowedError' }; } });
  const starting = h.session.start(); h.loaded();
  await assert.rejects(starting, /Mikrofonzugriff/);
  assert.equal(h.result.ready, 0);
});
test('Worker failure stops recording and reports the interruption', async () => {
  const h = harness(); const starting = h.session.start(); h.loaded(); await starting;
  h.emit('error'); assert.equal(h.result.tracksStopped, 1); assert.equal(h.result.removed, 1);
  assert.equal(h.result.errors.length, 1);
});
