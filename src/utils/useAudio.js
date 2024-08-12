
import * as THREE from "three";
import BeatsUrl from "../assets/Interview.mp3";

import { useState, useEffect, useCallback, useRef } from "react";

export default function useAudioAnalyzer(audioFileUrl = BeatsUrl) {
    const audioContextRef = useRef(null);
    const audioSourceRef = useRef(null);
    const analyzerRef = useRef(null);
    const [isListening, setIsListening] = useState(false);
    const [audioType, setAudioType] = useState('microphone');
    const audioDataRef = useRef(new Uint8Array(32));
  
    const initAudio = useCallback(() => {
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const listener = new THREE.AudioListener();
        audioSourceRef.current = new THREE.Audio(listener);
        analyzerRef.current = new THREE.AudioAnalyser(audioSourceRef.current, 32);
      }
    }, []);
  
    useEffect(() => {
      return () => {
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };
    }, []);
  
    const startListening = useCallback(async () => {
      initAudio(); // Убедимся, что AudioContext создан и не закрыт
  
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
  
      if (isListening) return;
  
      try {
        if (audioType === 'microphone') {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioContextRef.current.createMediaStreamSource(stream);
          audioSourceRef.current.setNodeSource(source);
        } else if (audioType === 'file') {
          const response = await fetch(audioFileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          audioSourceRef.current.setBuffer(audioBuffer);
          audioSourceRef.current.setLoop(true);
          audioSourceRef.current.play();
        }
        setIsListening(true);
      } catch (error) {
        console.error('Error starting audio:', error);
      }
    }, [audioType, audioFileUrl, isListening, initAudio]);
  
    const stopListening = useCallback(() => {
      if (!isListening) return;
  
      if (audioType === 'microphone') {
        audioSourceRef.current.disconnect();
      } else if (audioType === 'file') {
        audioSourceRef.current.stop();
      }
      setIsListening(false);
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.suspend();
      }
    }, [isListening, audioType]);
  
    const switchAudioType = useCallback((type) => {
      if (isListening) {
        stopListening();
      }
      setAudioType(type);
    }, [isListening, stopListening]);
  
    const updateAudioData = useCallback(() => {
      if (isListening && analyzerRef.current) {
        analyzerRef.current.getFrequencyData(audioDataRef.current);
      }
    }, [isListening]);
  
    return {
      isListening,
      startListening,
      stopListening,
      switchAudioType,
      audioType,
      updateAudioData,
      audioDataRef,
    };
  }