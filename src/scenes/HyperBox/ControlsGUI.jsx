import { useEffect, useRef } from "react";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import params from "./params";

function ControlsGUI({ onParamsChange }) {
  const guiRef = useRef();

  useEffect(() => {
    const gui = new GUI();
    guiRef.current = gui;

    gui.add(params, "WIDTH", 1000, 9000, 100);
    gui.add(params, "spin");
    gui.add(params, "boxOut", 1, 10, 0.1);
    gui.add(params, "boxIn", 1, 10, 0.1);
    gui.add(params, "limit", 5, 30, 1);
    gui.add(params, "maxRadius", 1, 10, 0.1);
    gui.add(params, "timeSpeed", 0, 2, 0.01);
    gui.add(params, "streamSpeed", 0.5, 2, 0.01);
    gui.add(params, "boxHelperVisible");
    gui.add(params, "GeometryVisible");
    gui.add(params, "maxParticleCount", 100, 15000, 100);
    gui.add(params, "particleCount", 2, 1000);
    gui.add(params, "sideLength", 1, 10, 0.1);
    gui.add(params, "maxConnections", 1, 100, 1);
    gui.add(params, "showMesh");
    gui.add(params, "offset", 0.1, 20, 0.5);

    gui.onChange(() => {
      onParamsChange(params);
    });

    return () => {
      gui.destroy();
    };
  }, [onParamsChange]);

  return null;
}

export default ControlsGUI;
