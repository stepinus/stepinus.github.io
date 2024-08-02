export default function Postpro() {
  const water = useRef();
  const data = useLoader(LUTCubeLoader, "/cubicle.CUBE");
  useFrame((state) => (water.current.time = state.clock.elapsedTime * 4));
  return (
    <Effects disableGamma>
      <waterPass ref={water} factor={1} />
      <unrealBloomPass args={[undefined, 1.25, 1, 0]} />
      <filmPass args={[0.2, 0.5, 1500, false]} />
      <lUTPass lut={data.texture} intensity={0.75} />
    </Effects>
  );
}
