// src/workers/mp3-encoder.worker.js
import lamejs from 'lamejs';

self.onmessage = function(e) {
    const wavBuffer = e.data;
    const wavSamples = new Int16Array(wavBuffer);

    const mp3encoder = new lamejs.Mp3Encoder(1, 44100, 128); // mono, 44.1kHz, 128kbps
    const mp3Data = [];

    const sampleBlockSize = 1152;
    for (let i = 0; i < wavSamples.length; i += sampleBlockSize) {
        const sampleChunk = wavSamples.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
    }

    const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });
    self.postMessage(mp3Blob);
};
