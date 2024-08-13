import { create } from 'zustand'
import * as THREE from 'three';
import processAudioData from "./utils/processAudioData.js";


export const statusMap = {
    isIdle: 0,
    isRecording: 1,
    isWaitingForResponse:2,
    isSpeaking:3,
}
export const useStore = create((set, get) => ({
    isInit: false,
    status: statusMap.isIdle,
    userId:null,
    audioContext: null,
    audioData: {intensity:0},
    setStatus: (status) => set((state) => ({ status })),
    setUserId: (userId) => set((state) => ({ userId })),
    setAudioData: (data) => set({ audioData: processAudioData(data) }),
    initAudio: async () => {
        return new Promise((resolve) => {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            set({ audioContext, isInit: true });
            console.log('Audio initialized');
            resolve();
        });
    },
}))