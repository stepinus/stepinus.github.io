import React, { useCallback, useEffect, useRef, useState } from "react";
import Mesh from "./scenes/WiremeshFantacy";
import styles from "./styles.module.css";
import { useStore, statusMap } from "./store.js";
import 'boxicons';
import getUserId from "./utils/getUserId.js";
import { Leva } from "leva";

const App = () => {
    const setStatus = useStore((state) => state.setStatus);
    const setUserId = useStore((state) => state.setUserId);
    const status = useStore((state) => state.status);
    // const [audioBlob, setAudioBlob] = useState(null);

    const mediaRecorder = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const source = useRef(null);
    const setAudioData = useStore((state) => state.setAudioData);
    const workerRef = useRef(null);

    useEffect(() => {
        workerRef.current = new Worker(new URL('./workers/mp3-encoder.worker.js', import.meta.url), { type: 'module' });
        workerRef.current.onmessage = async (e) => {
            const mp3Blob = e.data;
            await sendAudioToAPI(mp3Blob);
        };

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
            }
        };
    }, []);

    const initAudio = () => {
        audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        analyser.current = audioContext.current.createAnalyser();
        analyser.current.fftSize = 64;
    }

    const updateAudioData = () => {
        const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
        analyser.current.getByteFrequencyData(dataArray);
        setAudioData(dataArray);
        if (useStore.getState().status === statusMap.isRecording) {
            requestAnimationFrame(updateAudioData);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
            mediaRecorder.current.stop();
            setStatus(statusMap.isWaitingForResponse);
            setAudioData(null);
        }
    }

    const sendAudioToAPI = async (blob) => {
        const formData = new FormData();
        formData.append('userID', useStore.getState().userId);
        formData.append('file', blob, 'audio.mp3');
        try {
            const response = await fetch('https://signal.ai-akedemi-project.ru:5004/recognition-audio/', {
                method: 'POST',
                body: formData,
            });
            console.log(response);
            const data = await response.json();
            console.log('API response:');
            console.log(data);

            setStatus(statusMap.isIdle);
        } catch (error) {
            console.error('Error sending audio to API:');
            console.error(error);
            setStatus(statusMap.isIdle);
        }
    };

    const startRecording = async () => {
        if (!audioContext.current) initAudio();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/wav' });
            mediaRecorder.current.addEventListener('dataavailable', handleDataAvailable);
            source.current = audioContext.current.createMediaStreamSource(stream);
            source.current.connect(analyser.current);
            mediaRecorder.current.start();
            setStatus(statusMap.isRecording)
            updateAudioData();
            setTimeout(() => {
                stopRecording()
            }, 15 * 60 * 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const handleDataAvailable = async (event) => {
        const wavBlob = event.data;
        setAudioBlob(wavBlob);

        const arrayBuffer = await wavBlob.arrayBuffer();
        workerRef.current.postMessage(arrayBuffer, [arrayBuffer]);
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
                hidden={false}
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
