import React from "react";
import { useControls, button } from "leva";
import params from "./params";

function ControlsGUI({ onParamsChange }) {
  const values = useControls({
    WIDTH: { value: params.WIDTH, min: 1000, max: 9000, step: 100 },
    spin: { value: params.spin },
    boxOut: { value: params.boxOut, min: 1, max: 10, step: 0.1 },
    boxIn: { value: params.boxIn, min: 1, max: 10, step: 0.1 },
    limit: { value: params.limit, min: 5, max: 30, step: 1 },
    maxRadius: { value: params.maxRadius, min: 1, max: 10, step: 0.1 },
    timeSpeed: { value: params.timeSpeed, min: 0, max: 2, step: 0.01 },
    streamSpeed: { value: params.streamSpeed, min: 0.5, max: 2, step: 0.01 },
    boxHelperVisible: { value: params.boxHelperVisible },
    GeometryVisible: { value: params.GeometryVisible },
    maxParticleCount: { value: params.maxParticleCount, min: 100, max: 15000, step: 100 },
    particleCount: { value: params.particleCount, min: 2, max: 1000 },
    sideLength: { value: params.sideLength, min: 1, max: 10, step: 0.1 },
    maxConnections: { value: params.maxConnections, min: 1, max: 100, step: 1 },
    showMesh: { value: params.showMesh },
    offset: { value: params.offset, min: 0.1, max: 40, step: 0.5 },
    Reset: button(() => {
      // Reset all values to their initial state
      onParamsChange(params);
    })
  }, { onChange: (values) => onParamsChange(values) });

  return null; // Leva creates its own UI, so we don't need to render anything here
}

export default ControlsGUI;
