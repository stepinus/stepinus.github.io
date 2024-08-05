import React, { useState } from "react";
import HyperCubeScene from "./scenes/HyperBox/index";
import AnotherScene from "./scenes/MorhingScruct/Scene"; // Пример другой сцены
import Mesh from "./scenes/WiremeshFantacy";
import "./styles.css"; // Импортируем стили

const App = () => {
  const [selectedTab, setSelectedTab] = useState(1);

  return (
    <div className="app">
      <Mesh />
    </div>
  );
};

export default App;
