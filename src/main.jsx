import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles.module.css";
import AudioRecorder from "simple-audio-recorder";
// AudioRecorder.preload("./mp3worker.js");
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
