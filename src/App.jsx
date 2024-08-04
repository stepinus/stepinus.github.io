import React, { useState } from "react";
import HyperCubeScene from "./scenes/HyperBox/index";
import AnotherScene from "./scenes/MorhingScruct/Scene"; // Пример другой сцены
import Mesh from "./scenes/WiremeshFantacy";
import "./styles.css"; // Импортируем стили

const App = () => {
  const [selectedTab, setSelectedTab] = useState(1);

  return (
    <div className="app">
      <div className="tabs">
        <button
          className={`tab ${selectedTab === 0 ? "active" : ""}`}
          onClick={() => setSelectedTab(0)}
        >
          HyperCube
        </button>
        <button
          className={`tab ${selectedTab === 1 ? "active" : ""}`}
          onClick={() => setSelectedTab(1)}
        >
          Morthing Cube
        </button>
      </div>
      <button
        className={`tab ${selectedTab === 2 ? "active" : ""}`}
        onClick={() => setSelectedTab(2)}
      >
        Mesh
      </button>
      <div className="tab-content">
        {selectedTab === 0 && <HyperCubeScene />}
        {selectedTab === 1 && <Mesh/>}
        {selectedTab === 2 && <Mesh />}
      </div>
    </div>
  );
};

export default App;
