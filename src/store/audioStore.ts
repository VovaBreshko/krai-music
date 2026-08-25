import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Track } from '../types/content'

type AudioStoreState = {
  queue: Track[]
  currentTrack: Track | null
  isPlaying: boolean
  isVisible: boolean
  volume: number
  muted: boolean
  progress: number
  duration: number
  currentTime: number
  repeat: boolean
  shuffle: boolean
  // «Ревизия» (пере)запуска воспроизведения: растёт при каждом действии, которое должно
  // начать выбранный трек с начала (playTrack / nextTrack / previousTrack). Player использует
  // её, чтобы надёжно рестартовать «тот же самый» источник из <audio>.
  playbackRevision: number
}

interface AudioState extends AudioStoreState {
  setQueue: (queue: Track[]) => void
  playTrack: (track: Track, queue?: Track[]) => void
  togglePlay: () => void
  closePlayer: () => void
  nextTrack: () => void
  previousTrack: () => void
  seek: (value: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleRepeat: () => void
  toggleShuffle: () => void
  setCurrentTime: (value: number) => void
  setDuration: (value: number) => void
  setProgress: (value: number) => void
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentTrack: null,
      isPlaying: false,
      isVisible: true,
      volume: 0.8,
      muted: false,
      progress: 0,
      duration: 0,
      currentTime: 0,
      repeat: false,
      shuffle: false,
      playbackRevision: 0,
      setQueue: (queue: Track[]) => set({ queue }),
      playTrack: (track: Track, queue?: Track[]) => {
        const state = get()
        const playbackRevision = state.playbackRevision + 1
        if (state.currentTrack?.id === track.id) {
          set({
            currentTrack: { ...track },
            progress: 0,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
            isVisible: true,
            playbackRevision,
          })
          return
        }
        const nextQueue = queue ?? get().queue
        const exists = nextQueue.some((item: Track) => item.id === track.id)
        const mergedQueue = exists ? nextQueue : [track, ...nextQueue]
        set({
          currentTrack: track,
          queue: mergedQueue,
          isPlaying: true,
          isVisible: true,
          progress: 0,
          currentTime: 0,
          duration: 0,
          playbackRevision,
        })
      },
      togglePlay: () => set((state: AudioStoreState) => ({ isPlaying: state.currentTrack ? !state.isPlaying : state.isPlaying })),
      closePlayer: () =>
        set({
          isVisible: false,
          currentTrack: null,
          isPlaying: false,
          progress: 0,
          currentTime: 0,
          duration: 0,
        }),
      nextTrack: () => {
        const { queue, currentTrack, shuffle, repeat } = get()
        if (!queue.length) return
        const playbackRevision = get().playbackRevision + 1
        if (!currentTrack) {
          set({ currentTrack: queue[0], isPlaying: true, progress: 0, currentTime: 0, duration: 0, playbackRevision })
          return
        }
        if (repeat) {
          set({ currentTrack, isPlaying: true, progress: 0, currentTime: 0, playbackRevision })
          return
        }
        const index = queue.findIndex((track) => track.id === currentTrack.id)
        if (index === -1) {
          set({ currentTrack: queue[0], isPlaying: true, progress: 0, currentTime: 0, duration: 0, playbackRevision })
          return
        }
        let nextIndex = (index + 1) % queue.length
        if (shuffle) {
          nextIndex = Math.floor(Math.random() * queue.length)
          while (nextIndex === index && queue.length > 1) {
            nextIndex = Math.floor(Math.random() * queue.length)
          }
        }
        const track = queue[nextIndex]
        set({ currentTrack: track, isPlaying: true, progress: 0, currentTime: 0, duration: 0, playbackRevision })
      },
      previousTrack: () => {
        const { queue, currentTrack, shuffle, repeat } = get()
        if (!queue.length || !currentTrack) return
        const playbackRevision = get().playbackRevision + 1
        if (repeat) {
          set({ currentTrack, isPlaying: true, progress: 0, currentTime: 0, playbackRevision })
          return
        }
        const index = queue.findIndex((track) => track.id === currentTrack.id)
        if (index === -1) {
          set({ currentTrack: queue[0], isPlaying: true, progress: 0, currentTime: 0, duration: 0, playbackRevision })
          return
        }
        let previousIndex = index > 0 ? index - 1 : queue.length - 1
        if (shuffle) {
          previousIndex = Math.floor(Math.random() * queue.length)
          while (previousIndex === index && queue.length > 1) {
            previousIndex = Math.floor(Math.random() * queue.length)
          }
        }
        set({ currentTrack: queue[previousIndex], isPlaying: true, progress: 0, currentTime: 0, duration: 0, playbackRevision })
      },
      seek: (value: number) => set({ progress: value, currentTime: value }),
      setVolume: (volume: number) => set({ volume }),
      toggleMute: () => set((state: AudioStoreState) => ({ muted: !state.muted })),
      toggleRepeat: () => set((state: AudioStoreState) => ({ repeat: !state.repeat })),
      toggleShuffle: () => set((state: AudioStoreState) => ({ shuffle: !state.shuffle })),
      setCurrentTime: (value: number) => set({ currentTime: value }),
      setDuration: (value: number) => set({ duration: value }),
      setProgress: (value: number) => set({ progress: value }),
    }),
    {
      name: 'kray-audio-store',
      partialize: (state: AudioState) => ({ volume: state.volume, muted: state.muted, queue: state.queue, currentTrack: state.currentTrack, repeat: state.repeat, shuffle: state.shuffle }),
    },
  ),
)
