import React, { useState } from 'react';
import HyperCubeScene from './scenes/HyperBox/index';
import AnotherScene from './scenes/MorhingScruct/Scene'; // Пример другой сцены
import './App.css'; // Импортируем стили

const App = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <div className="app">
      <div className="tabs">
        <button className={`tab ${selectedTab === 0 ? 'active' : ''}`} onClick={() => setSelectedTab(0)}>
          HyperCube
        </button>
        <button className={`tab ${selectedTab === 1 ? 'active' : ''}`} onClick={() => setSelectedTab(1)}>
          Morthing Cube
        </button>
      </div>
      <div className="tab-content">
        {selectedTab === 0 && <HyperCubeScene />}
        {selectedTab === 1 && <AnotherScene />}
      </div>
    </div>
  );
};

export default App;
