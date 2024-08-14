import React, { useEffect, useRef, useState } from "react";
import Mesh from "./scenes/WiremeshFantacy";
import styles from "./styles.module.css";
import { useStore, statusMap } from "./store.js";
import 'boxicons'
import getUserId from "./utils/getUserId.js";
import { Leva } from "leva";
import MicRecorder from '@jmd01/mic-recorder-to-mp3';

const USE_LIBRARY_FALLBACK = true; // Константа для переключения между библиотекой и mp4

const App = () => {
    const [recorder] = useState(new MicRecorder({ bitRate: 128 }));
    const setStatus = useStore((state) => state.setStatus);
    const setUserId = useStore((state) => state.setUserId);
    const status = useStore((state) => state.status);
    const [microphoneStream, setMicrophoneStream] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [useAlternativeMethod, setUseAlternativeMethod] = useState(false);
    const [isSpacePressed, setIsSpacePressed] = useState(false);
    const mediaRecorder = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const source = useRef(null);
    const gainNode = useRef(null);


    const setAudioData = useStore((state) => state.setAudioData);

    const initAudio = () => {
        if (audioContext.current) {
            audioContext.current.close();
        }
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 64;
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 1;
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
        if (!useAlternativeMethod) {
            if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
                mediaRecorder.current.stop();
            }
            if (microphoneStream) {
                microphoneStream.getTracks().forEach(track => track.stop());
                setMicrophoneStream(null);
            }
        } else if (USE_LIBRARY_FALLBACK) {
            recorder.stop().getMp3().then(([buffer, blob]) => {
                setAudioBlob(blob);
                sendAudioToAPI(blob, 'audio/mpeg');
            }).catch((e) => {
                console.error("Error stopping MicRecorder:", e);
                setStatus(statusMap.isIdle);
            });
        }
        setStatus(statusMap.isWaitingForResponse);
        setAudioData(null);
    }

    const sendAudioToAPI = async (blob, mimeType) => {
        const formData = new FormData();
        formData.append('userID', useStore.getState().userId);
        formData.append('file', blob, `audio.${mimeType.split('/')[1]}`);

        try {
            const response = await fetch((!import.meta.env.DEV ? '/api/recognition-audio/' : '/api/recognition-audio/'), {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = response.body.getReader();
            const chunks = [];

            async function read() {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    chunks.push(value);
                }
            }

            await read();

            const audioBlob = new Blob(chunks, { type: 'audio/mpeg' });
            const arrayBuffer = await audioBlob.arrayBuffer();

            initAudio();

            if (!audioContext.current) initAudio();

            const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);

            const source = audioContext.current.createBufferSource();
            source.buffer = audioBuffer;

            source.connect(gainNode.current);
            gainNode.current.connect(analyser.current);
            analyser.current.connect(audioContext.current.destination);

            setStatus(statusMap.isSpeaking);
            updateAudioData();

            source.onended = () => {
                setStatus(statusMap.isIdle);
                setAudioData(null);
                audioContext.current.close();
                audioContext.current = null;
            };

            source.start();

        } catch (error) {
            console.error('Error sending audio to API:', error);
            setStatus(statusMap.isIdle);
        }
    };
    const handleKeyDown = (event) => {
        if (event.code === 'KeyS' && status === statusMap.isIdle) {
            startRecording();
        } else if (event.code === 'KeyS' && status === statusMap.isRecording) {
            stopRecording();
        } else if (event.code === 'Space' && status === statusMap.isIdle && !isSpacePressed) {
            setIsSpacePressed(true);
            startRecording();
        } else if (event.code ==='KeyR'){
            setStatus(statusMap.isIdle);
        }
    };
    const handleKeyUp = (event) => {
        if (event.code === 'Space' && status === statusMap.isRecording) {
            setIsSpacePressed(false);
            stopRecording();
        }
    };
    useEffect(() => {
        const id = getUserId();
        setUserId(id);
        return () => {
            if (audioContext.current) {
                audioContext.current.close();
            }
        };
    }, [])
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [status, isSpacePressed]);

    const startRecording = async () => {
        initAudio();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicrophoneStream(stream);

            const isWebmSupported = MediaRecorder.isTypeSupported('audio/webm');

            if (!isWebmSupported) {
                setUseAlternativeMethod(true);
                if (USE_LIBRARY_FALLBACK) {
                    await recorder.start();
                } else {
                    const mimeType = 'audio/mp4';
                    mediaRecorder.current = new MediaRecorder(stream, { mimeType });
                    mediaRecorder.current.addEventListener('dataavailable', (event) => handleDataAvailable(event, mimeType));
                    mediaRecorder.current.start();
                }
            } else {
                const mimeType = 'audio/webm';
                mediaRecorder.current = new MediaRecorder(stream, { mimeType });
                mediaRecorder.current.addEventListener('dataavailable', (event) => handleDataAvailable(event, mimeType));
                mediaRecorder.current.start();
            }

            source.current = audioContext.current.createMediaStreamSource(stream);
            source.current.connect(analyser.current);

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
                {status === statusMap.isIdle && (
                    <button className={styles.round} onClick={startRecording}>
                        <box-icon name='circle' type='solid' color='red' size="md"></box-icon>
                    </button>
                )}
                {status === statusMap.isRecording && (
                    <button className={styles.round} onClick={stopRecording}>
                        <box-icon name='stop' color='red' size="lg"></box-icon>
                    </button>
                )}
                {status === statusMap.isWaitingForResponse && (
                    <button className={styles.round} onClick={stopRecording}>
                        <box-icon name='dots-horizontal-rounded' color="white"></box-icon>
                    </button>
                )}
            </div>
        </div>
    );
};

export default App;