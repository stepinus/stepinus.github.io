import React, { useState } from "react";
import Mesh from "./scenes/WiremeshFantacy";
import "./styles.css"; // Импортируем стили

const App = () => {

  return (
    <div className="app">
      <Mesh />
    </div>
  );
};

export default App;
