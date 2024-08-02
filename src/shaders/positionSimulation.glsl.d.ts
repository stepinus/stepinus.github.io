declare module '@shaders/positionSimulation.glsl' {
    namespace THREE {
        export type Texture = { image: unknown, isTexture: true, isCubeTexture?: never };
        export type Matrix4 = { elements: number[], setFromMatrix3: unknown };
    }

    const positionSimulation: string;

    type Uniforms = {
        time: number,
        delta: number,
        texturePosition: WebGLTexture | THREE.Texture,
        boxMatrixInv: [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number] | Float32Array | [[number, number, number, number], [number, number, number, number], [number, number, number, number], [number, number, number, number]] | THREE.Matrix4,
        boxOut: number,
        boxIn: number,
        rotX: number,
        rotZ: number,
        limit: number,
        maxRadius: number
    };

    export {
        positionSimulation as default,
        positionSimulation as glsl,
        positionSimulation,
        Uniforms,
        Uniforms as PositionSimulationUniforms
    };
}