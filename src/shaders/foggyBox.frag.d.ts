declare module '@shaders/foggyBox.frag' {
    namespace THREE {
        export type Vector3 = { x: number, y: number, z: number, isVector3: true };
        export type Color = { r: number, g: number, b: number, isColor: true };
    }

    const foggyBox: string;

    type Uniforms = {
        uColor: [number, number, number] | Float32Array | THREE.Vector3 | THREE.Color,
        uOpacity: number
    };

    export {
        foggyBox as default,
        foggyBox as glsl,
        foggyBox,
        Uniforms,
        Uniforms as FoggyBoxUniforms
    };
}