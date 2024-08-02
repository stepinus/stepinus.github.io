declare module '@shaders/pointsVert.glsl' {
    namespace THREE {
        export type Texture = { image: unknown, isTexture: true, isCubeTexture?: never };
        export type Matrix4 = { elements: number[], setFromMatrix3: unknown };
    }

    const pointsVert: string;

    type Uniforms = {
        posTexture: WebGLTexture | THREE.Texture,
        boxMatrixInv: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]] | THREE.Matrix4,
        boxOut: number,
        boxIn: number
    };

    export {
        pointsVert as default,
        pointsVert as glsl,
        pointsVert,
        Uniforms,
        Uniforms as PointsVertUniforms
    };
}