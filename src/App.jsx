import React, { useCallback, useEffect, useRef, useState } from "react";
import Mesh from "./scenes/WiremeshFantacy";
import styles from "./styles.module.css";
import { useStore, statusMap } from "./store.js"; // Импортируем стили
import 'boxicons'
import getUserId from "./utils/getUserId.js";
import * as THREE from "three";
import { Leva } from "leva";
import speech from './result2.mp3'

const App = () => {
    const setStatus = useStore((state) => state.setStatus);
    const setUserId = useStore((state) => state.setUserId);
    const status = useStore((state) => state.status);
    const [microphoneStream, setMicrophoneStream] = useState(null);

    const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorder = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const source = useRef(null);
    const gainNode = useRef(null);

    const setAudioData = useStore((state) => state.setAudioData);

    const initAudio = () => {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 64;
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 3; // Увеличиваем громкость в 4 раза

    }

    const updateAudioData = () => {
        const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
        analyser.current.getByteFrequencyData(dataArray);
        setAudioData(dataArray);
        if (useStore.getState().status === statusMap.isRecording || useStore.getState().status === statusMap.isSpeaking) {
            requestAnimationFrame(updateAudioData);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            if (microphoneStream) {
                microphoneStream.getTracks().forEach(track => track.stop());
                setMicrophoneStream(null);
            }
            mediaRecorder.current.stop();
            setStatus(statusMap.isWaitingForResponse);
            setAudioData(null);
        }
    }

    const sendAudioToAPI = async (blob, mimeType) => {
        const formData = new FormData();
        formData.append('userID', useStore.getState().userId);
        formData.append('file', blob, 'audio.' + (mimeType === 'audio/mp4' ? 'mp4' : 'webm'));
        console.log('env', import.meta.env.DEV)
        try {
            const response = await fetch((!import.meta.env.DEV ? '/api/recognition-audio/' : 'https://generate.ai-akedemi-project.ru/recognition-audio/'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Получаем поток из ответа
            const reader = response.body.getReader();
            const chunks = [];

            // Читаем поток
            async function read() {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }
            }

            await read();

            // Создаем Blob из полученных данных
            const audioBlob = new Blob(chunks, { type: 'audio/mpeg' }); // Измените MIME-тип в зависимости от формата аудио
            const audioUrl = URL.createObjectURL(audioBlob);

            // Создаем и воспроизводим аудио
            const audio = new Audio(audioUrl);
            audio.controls = true; // Добавляем элементы управления аудио
            document.body.appendChild(audio); // Добавляем элемент на страницу

            // Начинаем записывать данные при воспроизведении
            audio.addEventListener('play', () => {
                setStatus(statusMap.isSpeaking);
                updateAudioData(); // Обновляем данные аудио
            });

            // Останавливаем запись данных после окончания воспроизведения
            audio.addEventListener('ended', () => {
                setStatus(statusMap.isIdle);
                setAudioData(null);
            });

            // Воспроизводим аудио
            await audio.play();

        } catch (error) {
            console.error('Error sending audio to API:', error);
            setStatus(statusMap.isIdle);
        }
    };
    // const sendAudioToAPI = async (blob, mimeType) => {
    //     const audioUrl = speech; // Путь к вашему локальному файлу
    //     stopRecording()
    //     try {
    //         if (!audioContext.current) initAudio();
    //
    //         const response = await fetch(audioUrl);
    //         const arrayBuffer = await response.arrayBuffer();
    //         const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
    //
    //         const source = audioContext.current.createBufferSource();
    //         source.buffer = audioBuffer;
    //
    //         source.connect(gainNode.current);
    //         gainNode.current.connect(analyser.current);
    //         analyser.current.connect(audioContext.current.destination);
    //
    //         setStatus(statusMap.isSpeaking);
    //         updateAudioData();
    //
    //         source.onended = () => {
    //             setStatus(statusMap.isIdle);
    //             setAudioData(null);
    //         };
    //
    //         source.start();
    //
    //     } catch (error) {
    //         console.error('Error playing debug audio:', error);
    //         setStatus(statusMap.isIdle);
    //     }
    // };
    const startRecording = async () => {
        if (!audioContext.current) initAudio();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicrophoneStream(stream);
            // Проверяем поддержку MIME-типа
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/mp4';
            }

            mediaRecorder.current = new MediaRecorder(stream, { mimeType });
            mediaRecorder.current.addEventListener('dataavailable', (event) => handleDataAvailable(event, mimeType));
            source.current = audioContext.current.createMediaStreamSource(stream);
            source.current.connect(analyser.current);
            mediaRecorder.current.start();
            setStatus(statusMap.isRecording);
            updateAudioData();
            setTimeout(() => {
                stopRecording();
            }, 15 * 60 * 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const handleDataAvailable = async (event, mimeType) => {
        const blob = new Blob([event.data], { type: mimeType });
        setAudioBlob(blob);
        await sendAudioToAPI(blob, mimeType);
    };

    useEffect(() => {
        const id = getUserId();
        setUserId(id);
    }, [])

    return (
        <div className={styles.app}>
            <Leva
                flat
                hideTitleBar
                collapsed
                hidden={true}
            />
            <Mesh/>
            <div className={styles.controls_container}>
                {status === statusMap.isIdle && <button
                    className={styles.round}
                    onClick={startRecording}
                >
                    <box-icon name='circle' type='solid' color='red' size="md"></box-icon>
                </button>}
                {status === statusMap.isRecording && <button
                    className={styles.round}
                    onClick={stopRecording}
                >
                    <box-icon name='stop' color='red' size="lg"></box-icon>
                </button>}
                {status === statusMap.isWaitingForResponse && <button
                    className={styles.round}
                    onClick={stopRecording}
                >
                    <box-icon name='dots-horizontal-rounded' color="white"></box-icon>
                </button>}
            </div>
        </div>
    );
};

export default App;
