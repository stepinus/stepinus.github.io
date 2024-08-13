import React, { useState, useEffect, useRef } from "react";
import interview from "../assets/Interview.mp3";

const EntryOverlay = ({ onStart }) => {
  const [audioUrl, setAudioUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const audioRef = useRef(null);

  const handleStart = async () => {};

  const sendToServer = async () => {
    if (!file) return;
    try {
      const form = new FormData();
      form.append("file", file);
      const serverResponse = await fetch(
        "http://signal.ai-akedemi-project.ru:5004/recognition-audio/",
        {
          method: "POST",

          mode: "cors",

          body: form,
        }
      );

      if (serverResponse.ok) {
        console.log("Ответ получен успешно");
        const arrayBuffer = await serverResponse.arrayBuffer();
        console.log(
          "Размер полученных данных:",
          arrayBuffer.byteLength,
          "байт"
        );
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(blob);
        setAudioUrl(audioUrl);
        console.log("Audio URL создан:", audioUrl);
        if (audioRef.current) {
          console.log("au");
          audioRef.current
            .play()
            .then(() => console.log("Воспроизведение началось"))
            .catch((e) => console.error("Автовоспроизведение не удалось:", e));
        }
      } else {
        console.log(
          "Ошибка ответа сервера:",
          serverResponse.status,
          serverResponse.statusText
        );
        throw new Error("Ошибка при отправке файла");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    const convertToBase64 = async () => {
      const response = await fetch(interview);
      const blob = await response.blob();
      const file = new File([blob], "result2.mp3", { type: "audio/mpeg" });

      const form = new FormData();
      form.append("file", file);
      setFile(file);
    };
    convertToBase64();
  }, []);
  return (
    <div
      onClick={handleStart}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.0)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          border: "2px solid white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          cursor: "pointer",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <span style={{ color: "white", fontSize: "24px" }} onClick={onStart}>Начать</span>
      </div>
    </div>
  );
};

export default EntryOverlay;
