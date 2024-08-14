import React, { useEffect, useRef, useState } from "react";
import Mesh from "./scenes/WiremeshFantacy";
import styles from "./styles.module.css";
import { useStore, statusMap } from "./store.js";
import 'boxicons'
import getUserId from "./utils/getUserId.js";
import { Leva } from "leva";
import MicRecorder from '@jmd01/mic-recorder-to-mp3';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DELAY_STEP = 100; // Шаг изменения задержки в миллисекундах
const USE_LIBRARY_FALLBACK = true; // Константа для переключения между библиотекой и mp4
const ABOVE_THRESHOLD_DELAY = 300; // 1 секунда
const BELOW_THRESHOLD_DELAY = 2000; // 2 секунды
const THRESHOLD_STEP = 5; // Шаг изменения порога

const App = () => {
    const [recorder] = useState(new MicRecorder({ bitRate: 128 }));
    const setStatus = useStore((state) => state.setStatus);
    const setUserId = useStore((state) => state.setUserId);
    const autoMode = useStore((state)=>state.autoMode);
    const setAutoMode = useStore((state)=>state.setAutoMode);
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
    const autoModeStreamRef = useRef(null);
    const intensityThreshold = useStore((state) => state.intensityThreshold);
    const [isAboveThreshold, setIsAboveThreshold] = useState(false);
    const aboveThresholdTimer = useRef(null);
    const belowThresholdTimer = useRef(null);
    const [hasTriggeredAboveThreshold, setHasTriggeredAboveThreshold] = useState(false);
    const [hasLoggedAboveThreshold, setHasLoggedAboveThreshold] = useState(false);
    const aboveThresholdDelay = useStore((state) => state.aboveThresholdDelay);
    const belowThresholdDelay = useStore((state) => state.belowThresholdDelay);
    const setAboveThresholdDelay = useStore((state) => state.setAboveThresholdDelay);
    const setBelowThresholdDelay = useStore((state) => state.setBelowThresholdDelay);
    const setAudioData = useStore((state) => state.setAudioData);

    const checkIntensityThreshold = () => {
        const currentStatus = useStore.getState().status;
        const currentIntensity = useStore.getState().audioData?.rawIntensity || 0;
        const intensityThreshold = useStore.getState().intensityThreshold;
        const hasTriggeredAboveThreshold = useStore.getState().hasTriggeredAboveThreshold;
        const hasTriggeredBelowThreshold = useStore.getState().hasTriggeredBelowThreshold;
        const setHasTriggeredAboveThreshold = useStore.getState().setHasTriggeredAboveThreshold;
        const setHasTriggeredBelowThreshold = useStore.getState().setHasTriggeredBelowThreshold;

        if (currentStatus === statusMap.isIdle) {
            if (currentIntensity > intensityThreshold) {
                if (!hasTriggeredAboveThreshold) {
                    if (!aboveThresholdTimer.current) {
                        aboveThresholdTimer.current = setTimeout(() => {
                            setHasTriggeredAboveThreshold(true);
                            startRecording();
                        }, ABOVE_THRESHOLD_DELAY);
                    }
                }
            } else {
                if (aboveThresholdTimer.current) {
                    clearTimeout(aboveThresholdTimer.current);
                    aboveThresholdTimer.current = null;
                }
            }
        } else if (currentStatus === statusMap.isRecording) {
            if (currentIntensity <= intensityThreshold) {
                if (!hasTriggeredBelowThreshold) {
                    if (!belowThresholdTimer.current) {
                        belowThresholdTimer.current = setTimeout(() => {
                            setHasTriggeredBelowThreshold(true);
                            stopRecording();
                        }, BELOW_THRESHOLD_DELAY);
                    }
                }
            } else {
                if (belowThresholdTimer.current) {
                    clearTimeout(belowThresholdTimer.current);
                    belowThresholdTimer.current = null;
                }
            }
        } else {
            if (aboveThresholdTimer.current) {
                clearTimeout(aboveThresholdTimer.current);
                aboveThresholdTimer.current = null;
            }
            if (belowThresholdTimer.current) {
                clearTimeout(belowThresholdTimer.current);
                belowThresholdTimer.current = null;
            }
            setHasTriggeredAboveThreshold(false);
            setHasTriggeredBelowThreshold(false);
        }

        if (useStore.getState().autoMode) {
            requestAnimationFrame(checkIntensityThreshold);
        }
    };





    const initAudio = () => {
        if (audioContext.current) {
            audioContext.current.close();
        }
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 64;
        gainNode.current = audioContext.current.createGain();
        gainNode.current.gain.value = 1;
    };

    const updateAudioData = () => {
        if (!analyser.current) return;

        const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
        analyser.current.getByteFrequencyData(dataArray);
        setAudioData(dataArray);
        if (useStore.getState().autoMode || useStore.getState().status === statusMap.isRecording || useStore.getState().status === statusMap.isSpeaking) {
            requestAnimationFrame(updateAudioData);
        } else {
            setAudioData(null);
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
                if (autoMode) {
                    checkIntensityThreshold();
                }
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
        } else if (event.code === 'KeyR') {
            setStatus(statusMap.isIdle);
        } else if (event.code === 'KeyA') {
            const status = useStore.getState().autoMode
            setAutoMode(!status);
            toast(`авторежим ${useStore.getState().autoMode}`)
        } else if (event.code === 'Equal' || event.code === 'NumpadAdd') {
            useStore.getState().setIntensityThreshold(useStore.getState().intensityThreshold + THRESHOLD_STEP);
            toast(`порог увеличен до ${useStore.getState().intensityThreshold}`);
        } else if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
            useStore.getState().setIntensityThreshold(Math.max(0, useStore.getState().intensityThreshold - THRESHOLD_STEP));
            toast(`порог уменьшен до ${useStore.getState().intensityThreshold}`);
        } else if (event.code === 'BracketRight') {
            setAboveThresholdDelay(aboveThresholdDelay + DELAY_STEP);
            toast(`Задержка выше порога увеличена до ${aboveThresholdDelay + DELAY_STEP}мс`);
        } else if (event.code === 'BracketLeft') {
            setAboveThresholdDelay(Math.max(0, aboveThresholdDelay - DELAY_STEP));
            toast(`Задержка выше порога уменьшена до ${Math.max(0, aboveThresholdDelay - DELAY_STEP)}мс`);
        } else if (event.code === 'Quote') {
            setBelowThresholdDelay(belowThresholdDelay + DELAY_STEP);
            toast(`Задержка ниже порога увеличена до ${belowThresholdDelay + DELAY_STEP}мс`);
        } else if (event.code === 'Semicolon') {
            setBelowThresholdDelay(Math.max(0, belowThresholdDelay - DELAY_STEP));
            toast(`Задержка ниже порога уменьшена до ${Math.max(0, belowThresholdDelay - DELAY_STEP)}мс`);
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


    const startAutoModeListening = async () => {
        if (!audioContext.current) initAudio();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            autoModeStreamRef.current = stream;

            source.current = audioContext.current.createMediaStreamSource(stream);
            source.current.connect(analyser.current);

            updateAudioData();
        } catch (error) {
            console.error('Error accessing microphone for auto mode:', error);
        }
    };

    const stopAutoModeListening = () => {
        if (autoModeStreamRef.current) {
            autoModeStreamRef.current.getTracks().forEach(track => track.stop());
            autoModeStreamRef.current = null;
        }
        if (source.current) {
            source.current.disconnect();
            source.current = null;
        }
        if (analyser.current) {
            analyser.current.disconnect();
        }
        if (audioContext.current) {
            audioContext.current.close();
            audioContext.current = null;
        }
        setAudioData(null);
    };
    useEffect(() => {
        if (autoMode) {
            checkIntensityThreshold();
        } else {
            setIsAboveThreshold(false);
            setHasTriggeredAboveThreshold(false);
            if (aboveThresholdTimer.current) {
                clearTimeout(aboveThresholdTimer.current);
                aboveThresholdTimer.current = null;
            }
            if (belowThresholdTimer.current) {
                clearTimeout(belowThresholdTimer.current);
                belowThresholdTimer.current = null;
            }
        }

        return () => {
            if (aboveThresholdTimer.current) {
                clearTimeout(aboveThresholdTimer.current);
            }
            if (belowThresholdTimer.current) {
                clearTimeout(belowThresholdTimer.current);
            }
        };
    }, [autoMode, intensityThreshold]);

    useEffect(() => {
        if (status === statusMap.isIdle && autoMode) {
            startAutoModeListening();
        }
    }, [status, autoMode]);
    useEffect(() => {
        if (autoMode) {
            startAutoModeListening();
        } else {
            stopAutoModeListening();
            setStatus(statusMap.isIdle);
        }

        return () => {
            stopAutoModeListening();
        };
    }, [autoMode]);
    return (
        <div className={styles.app}>
            <Leva
                flat
                hideTitleBar
                collapsed
                hidden={false}
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
            <ToastContainer autoClose={1000} theme={'dark'}
                            hideProgressBar={true}/>
        </div>
    );
};

export default App;