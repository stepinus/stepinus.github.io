declare module '@shaders/undefined' {
    namespace THREE {
        export type Texture = { image: unknown, isTexture: true, isCubeTexture?: never };
        export type Matrix4 = { elements: number[], setFromMatrix3: unknown };
    }

    const undefined: string;

    type Uniforms = {
        posTexture: WebGLTexture | THREE.Texture,
        boxMatrixInv: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]] | THREE.Matrix4,
        boxOut: number,
        boxIn: number
    };

    export {
        undefined as default,
        undefined as glsl,
        undefined,
        Uniforms,
        Uniforms as UndefinedUniforms
    };
}