// Offline German recognition. Audio remains in this renderer and its local WASM worker.
(() => {
  let sharedModel;
  function loadModel() {
    if (sharedModel) return sharedModel;
    sharedModel = new Promise((resolve, reject) => {
      const model = new Vosk.Model(new URL('./model-de.tar.gz', location.href).href, -2);
      const fail = (message) => {
        if (message?.error) console.warn('Speech model load:', String(message.error).slice(0, 300));
        clearTimeout(timeout);
        model.terminate();
        sharedModel = undefined;
        reject(new Error('Das Sprachmodell konnte nicht geladen werden. Bitte starte die App erneut.'));
      };
      const timeout = setTimeout(fail, 60000);
      model.on('error', fail);
      model.on('load', message => {
        if (!message.result) return fail();
        clearTimeout(timeout);
        resolve(model);
      });
    });
    return sharedModel;
  }
  function microphoneError(error) {
    if (['NotAllowedError', 'SecurityError'].includes(error?.name)) {
      return new Error('Bitte erlaube den Mikrofonzugriff in Windows unter Einstellungen → Datenschutz → Mikrofon.');
    }
    if (['NotFoundError', 'DevicesNotFoundError'].includes(error?.name)) return new Error('Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.');
    if (error?.name === 'NotReadableError') return new Error('Das Mikrofon ist gerade nicht verfügbar. Bitte prüfe, ob eine andere App es verwendet.');
    return error instanceof Error ? error : new Error('Die Spracheingabe konnte nicht gestartet werden.');
  }
  function create(callbacks) {
    let closed = false, stopping = false, stream, context, source, processor, recognizer;
    let pending = 0, drain, finalResult, stopPromise, partial = '';
    const stopAudio = () => {
      if (processor) { processor.onaudioprocess = null; processor.disconnect(); }
      source?.disconnect();
      stream?.getTracks().forEach(track => track.stop());
      if (context && context.state !== 'closed') void context.close().catch(() => {});
    };
    const abort = () => {
      if (closed) return;
      closed = true;
      stopAudio();
      recognizer?.remove();
      drain?.();
      finalResult?.();
    };
    const completedChunk = () => {
      if (pending > 0) pending--;
      if (pending === 0) drain?.();
    };
    async function start() {
      try {
        const model = await loadModel();
        if (closed) return;
        const acquired = await navigator.mediaDevices.getUserMedia({
          video: false, audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });
        if (closed) { acquired.getTracks().forEach(track => track.stop()); return; }
        stream = acquired;
        context = new AudioContext({ sampleRate: 16000 });
        recognizer = new model.KaldiRecognizer(context.sampleRate);
        recognizer.on('partialresult', message => {
          if (closed) return;
          const text = message.result.partial;
          if (text !== partial) { partial = text; callbacks.onPartial(text); }
          completedChunk();
        });
        recognizer.on('result', message => {
          if (closed) return;
          partial = '';
          if (message.result.text) callbacks.onResult(message.result.text);
          callbacks.onPartial('');
          completedChunk();
          finalResult?.();
        });
        recognizer.on('error', () => {
          if (closed) return;
          abort();
          callbacks.onError(new Error('Die Spracheingabe wurde unterbrochen. Bitte versuche es erneut.'));
        });
        source = context.createMediaStreamSource(stream);
        processor = context.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = event => {
          if (closed || stopping) return;
          // Each submitted chunk yields one result/partialresult. Drain before requesting the final result.
          pending++;
          recognizer.acceptWaveform(event.inputBuffer);
        };
        source.connect(processor);
        processor.connect(context.destination); // Output is silent; never play microphone audio back.
        await context.resume();
        if (closed) return;
        callbacks.onReady();
      } catch (error) { abort(); throw microphoneError(error); }
    }
    function stop() {
      if (stopPromise) return stopPromise;
      stopPromise = (async () => {
        if (closed) return;
        stopping = true;
        stopAudio();
        if (!recognizer) { abort(); return; }
        let timeout;
        try {
          await Promise.race([
            (async () => {
              if (pending > 0) await new Promise(resolve => { drain = resolve; });
              if (closed) return;
              await new Promise(resolve => { finalResult = resolve; recognizer.retrieveFinalResult(); });
            })(),
            new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Die Spracheingabe konnte nicht vollständig ausgewertet werden. Bitte prüfe den erkannten Text.')), 10000); }),
          ]);
        } finally { clearTimeout(timeout); abort(); }
      })();
      return stopPromise;
    }
    return { start, stop, abort };
  }
  window.SprachplanerSpeech = Object.freeze({ create });
})();
