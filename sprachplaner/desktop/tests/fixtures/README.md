# Synthetic German microphone fixture

`german.wav` contains only synthesized speech: “Morgen um fünfzehn Uhr Zahnarzt.”
Generated with eSpeak NG (German voice) and converted to mono PCM16 at 16 kHz, plus two seconds of silence:

```sh
espeak-ng -v de -s 145 -w /tmp/sprachplaner-de.wav 'Morgen um fünfzehn Uhr Zahnarzt.'
ffmpeg -hide_banner -loglevel error -y -i /tmp/sprachplaner-de.wav -af apad=pad_dur=2 -ar 16000 -ac 1 -c:a pcm_s16le tests/fixtures/german.wav
```

Tests supply it through Chromium's fake microphone flags. It exercises actual capture, local WASM recognition, finalization and the planner's appointment parser. No human voice recording or personal data.
