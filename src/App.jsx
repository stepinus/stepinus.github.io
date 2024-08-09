import React, {useCallback, useEffect, useRef, useState} from "react";
import Mesh from "./scenes/WiremeshFantacy";
import styles from "./styles.module.css";
import {useStore, statusMap} from "./store.js"; // Импортируем стили
import 'boxicons'
import getUserId from "./utils/getUserId.js";
import * as THREE from "three";

const App = () => {
    const setStatus = useStore((state) => state.setStatus);
    const setUserId = useStore((state) => state.setUserId);
    const status = useStore((state) => state.status);

    const mediaRecorder = useRef(null);
    const audioContext = useRef(null);
    const analyser = useRef(null);
    const source = useRef(null);
    const setAudioData = useStore((state) => state.setAudioData);


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
            setStatus(statusMap.isIdle);
            setAudioData(null);
        }
    }
    const startRecording = async () => {
        if (!audioContext.current) initAudio();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});
            mediaRecorder.current = new MediaRecorder(stream);

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

    useEffect(() => {
        const id = getUserId();
        setUserId(id);
    }, [])
    return (
        <div className={styles.app}>
            <Mesh/>
            <div className={styles.controls_container}>
                {status === statusMap.isIdle && <button
                    className={styles.round}
                    onClick={startRecording}
                >
                    <box-icon name='circle' type='solid' color='red' size="lg"></box-icon>
                </button>}
                {status === statusMap.isRecording && <button
                    className={styles.round}
                    onClick={stopRecording}
                >
                    <box-icon name='square' type='solid' color='red' size="lg"></box-icon>
                </button>}
            </div>
        </div>
    )
        ;
};

export default App;
