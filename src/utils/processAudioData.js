const processAudioData = (data) => {
    if (!data || data.length === 0) {
        console.warn("No audio data available");
        return {bass: 0, treble: 0, intensity: 0};
    }

    const bass = data.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    const treble = data.slice(24).reduce((a, b) => a + b, 0) / 8;
    const intensity = data.reduce((a, b) => a + b, 0) / 32;
    return {
        bass: bass / 255,
        treble: treble / 255,
        intensity: intensity / 255,
    };
};
export default processAudioData;