declare module '@shaders/foggyBox.vert' {
    const foggyBox: string;

    type Uniforms = {
        uTime: number,
        uSpeed: number,
        uCurlFreq: number,
        uNoiseDensity: number,
        uNoiseStrength: number,
        uFrequency: number,
        uAmplitude: number,
        uOffsetSize: number
    };

    export {
        foggyBox as default,
        foggyBox as glsl,
        foggyBox,
        Uniforms,
        Uniforms as FoggyBoxUniforms
    };
}