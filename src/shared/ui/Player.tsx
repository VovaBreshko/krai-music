import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import { FiPause, FiPlay, FiSkipBack, FiSkipForward, FiVolume2, FiVolumeX, FiRepeat, FiShuffle, FiX } from 'react-icons/fi'
import styles from './Player.module.css'
import { useAudioStore } from '../../store/audioStore'
import { Link, useLocation } from 'react-router-dom'
import { getMediaUrl } from '../../shared/lib/media'
import { makeBackLinkState } from '../../shared/lib/backNav'
import { Media } from './Media'
import { TrackTitle } from './TrackTitle'
import { hasTitleTag } from '../../shared/lib/titleTag'

// Мобильная версия: ползунок громкости скрыт, звук всегда на максимуме
function subscribeToViewport(callback: () => void): () => void {
  const mql = window.matchMedia('(max-width: 620px)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getMobileSnapshot(): boolean {
  return window.matchMedia('(max-width: 620px)').matches
}

function useIsMobile(): boolean {
  return useSyncExternalStore(subscribeToViewport, getMobileSnapshot, () => false)
}

// Обнаруживает переполнение текстового элемента для marquee-прокрутки.
// Если содержимое шире видимой области, элемент получает класс `scrolling`,
// а расстояние «проката» записывается в CSS-переменную --marquee-distance.
function useMarqueeOverflow(ref: { current: HTMLElement | null }, dependency: unknown): boolean {
  const [isOverflowing, setIsOverflowing] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const overflow = el.scrollWidth > el.clientWidth + 1
      setIsOverflowing(overflow)
      el.style.setProperty('--marquee-distance', `${Math.max(0, el.scrollWidth - el.clientWidth)}px`)
    }
    update()

    // Пересчитываем при изменении размеров (окно, шрифты, раскладка), а не только при смене трека
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [ref, dependency])

  return isOverflowing
}

export function Player() {
  const location = useLocation()
  // Источник перехода — чтобы со страницы артиста можно было вернуться к прежней странице
  const backState = makeBackLinkState(location)
  const {
    currentTrack,
    isPlaying,
    isVisible,
    volume,
    muted,
    duration,
    currentTime,
    repeat,
    shuffle,
    togglePlay,
    closePlayer,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    setCurrentTime,
    setDuration,
    setProgress,
    playbackRevision,
  } = useAudioStore()

  const isMobile = useIsMobile()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  // Счётчик «явного» (пере)запуска воспроизведения — см. playbackRevision в audioStore.
  // По нему главный эффект ниже понимает, что currentTrack не изменился, но трек всё равно
  // нужно запустить заново (next/previous в очереди из одного трека, повторное «Слушать»).
  const handledRevisionRef = useRef(useAudioStore.getState().playbackRevision)

  // Длинные надписи — название трека и авторы: определяем, помещаются ли они в свою колонку.
  // Если не помещаются — включаем marquee-прокрутку и считаем дистанцию прокрутки.
  const titleRef = useRef<HTMLParagraphElement | null>(null)
  const isTitleOverflowing = useMarqueeOverflow(titleRef, currentTrack)

  const authorsRef = useRef<HTMLDivElement | null>(null)
  const isAuthorsOverflowing = useMarqueeOverflow(authorsRef, currentTrack)

  // Фактическая громкость: на мобильных всегда максимум, без беззвучного режима
  const effectiveVolume = isMobile ? 1 : volume
  const effectiveMuted = isMobile ? false : muted

  // Главный эффект: управление источником и воспроизведением
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    // Определяем, нужен ли (пере)запуск источника:
    // 1) в <audio> загружен другой трек (или на свежем <audio> после закрытия плеера
    //    src пуст) → грузим заново, даже если выбран «тот же самый» трек;
    // 2) источник тот же, но пользователь явно попросил начать трек с начала
    //    (next/previous в очереди из одного трека, повторное «Слушать» и т.п.).
    //    Про рост playbackRevision это видно надёжнее, чем по времени в сторе: его
    //    успевает «вернуть» событие timeupdate до того, как эффект выполнится.
    const url = getMediaUrl(currentTrack.audio)
    const isSameSource = audio.dataset.src === url
    const revisionChanged = playbackRevision !== handledRevisionRef.current
    if (!isSameSource || revisionChanged) {
      handledRevisionRef.current = playbackRevision
      audio.dataset.src = url
      audio.src = url
      audio.load()
      audio.currentTime = 0
      setCurrentTime(0)
      setProgress(0)
      setDuration(0)
    }

    // Управление воспроизведением
    if (isPlaying) {
      if (audio.paused) {
        void audio.play().catch(() => { })
      }
    } else {
      audio.pause()
    }
  }, [currentTrack, isPlaying, playbackRevision, setCurrentTime, setProgress, setDuration])

  // Эффект для громкости
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = effectiveVolume
    audio.muted = effectiveMuted
  }, [effectiveVolume, effectiveMuted])

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    seek(value)
    setCurrentTime(value)
    setProgress(value)
    if (audio) {
      audio.currentTime = value
    }
  }

  const handleTimeUpdate = () => {
    const audio = audioRef.current
    if (!audio) return
    setCurrentTime(audio.currentTime)
    setProgress(audio.currentTime)
  }

  const handleLoadedMetadata = () => {
    const audio = audioRef.current
    if (!audio) return
    setDuration(audio.duration || 0)
    audio.volume = effectiveVolume
    audio.muted = effectiveMuted
  }

  const handleCanPlay = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = effectiveVolume
    audio.muted = effectiveMuted
  }

  if (!currentTrack || !isVisible) {
    return null
  }

  const authors = currentTrack.authors ?? []
  const authorNames = authors.length > 0 ? authors.map((author) => author.nickname).join(', ') : 'Неизвестный артист'
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0
  const volumePercent = (muted ? 0 : volume) * 100

  const playerStyle = {
    '--player-progress': `${progressPercent}%`,
    '--volume-progress': `${volumePercent}%`,
  } as CSSProperties

  return (
    <div className={styles.player} style={playerStyle}>
      {/* Тонкая полоса прогресса во всю ширину — фирменный приём Яндекс Музыки */}
      <div className={styles.topTrack}>
        <div className={styles.topLine}>
          <div className={styles.topLineFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <input
          type="range"
          className={styles.topInput}
          min="0"
          max={duration || 100}
          step="0.1"
          value={currentTime}
          onChange={(e) => handleSeek(Number(e.target.value))}
          aria-label="Позиция воспроизведения"
        />
      </div>

      <div className={styles.body}>
        <div className={styles.leftGroup}>
          <span className={styles.timeText}>{formatTime(currentTime)}</span>
          <div className={styles.trackInfo}>
            {authors.length > 0 ? (
              <Link to={`/artists/${authors[0].id}`} state={backState} className={styles.coverLink} aria-label={`Открыть страницу ${authors[0].nickname}`}>
                <Media src={currentTrack.cover} alt={currentTrack.title} className={styles.cover} />
              </Link>
            ) : (
              <Media src={currentTrack.cover} alt={currentTrack.title} className={styles.cover} />
            )}
            <div className={styles.trackMeta}>
              <p
                ref={titleRef}
                className={`${styles.title} ${isTitleOverflowing ? styles.scrolling : ''}`}
                title={currentTrack.title}
                data-tagged={hasTitleTag(currentTrack.title)}
              >
                <span className={styles.marqueeInner}><TrackTitle title={currentTrack.title} /></span>
              </p>
              <div
                ref={authorsRef}
                className={`${styles.authors} ${isAuthorsOverflowing ? styles.scrolling : ''}`}
                title={authorNames}
              >
                <span className={styles.marqueeInner}>
                  {authors.length > 0 ? (
                    authors.map((author, index) => (
                      <span key={author.id}>
                        <Link to={`/artists/${author.id}`} state={backState} className={styles.artistLink}>
                          {author.nickname}
                        </Link>
                        {index < authors.length - 1 && ', '}
                      </span>
                    ))
                  ) : (
                    <span className={styles.artistLink}>Неизвестный артист</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.center}>
          <div className={styles.controls}>
            <button
              type="button"
              className={`${styles.stateButton} ${shuffle ? styles.active : ''}`}
              onClick={toggleShuffle}
              aria-label="Перемешать"
              title="Перемешать"
            >
              <FiShuffle size={15} />
            </button>
            <button type="button" className={styles.roundButton} onClick={previousTrack} aria-label="Предыдущий трек" title="Предыдущий трек">
              <FiSkipBack size={18} />
            </button>
            <button
              type="button"
              className={styles.playButton}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Пауза' : 'Слушать'}
              title={isPlaying ? 'Пауза' : 'Слушать'}
            >
              {isPlaying ? <FiPause size={19} className={styles.pauseIcon} /> : <FiPlay size={19} className={styles.playIcon} />}
            </button>
            <button type="button" className={styles.roundButton} onClick={nextTrack} aria-label="Следующий трек" title="Следующий трек">
              <FiSkipForward size={18} />
            </button>
            <button
              type="button"
              className={`${styles.stateButton} ${repeat ? styles.active : ''}`}
              onClick={toggleRepeat}
              aria-label="Повторить"
              title="Повторить"
            >
              <FiRepeat size={15} />
            </button>
          </div>
        </div>

        <div className={styles.rightGroup}>
          <div className={styles.utilities}>
            <div className={styles.volumeWrap}>
              <button
                type="button"
                className={`${styles.stateButton} ${muted ? styles.active : ''}`}
                onClick={toggleMute}
                aria-label="Выключить звук"
                title="Звук"
              >
                {muted ? <FiVolumeX size={17} /> : <FiVolume2 size={17} />}
              </button>
              <div className={styles.volumeTrack}>
                <div className={styles.volumeLine}>
                  <div className={styles.volumeLineFill} style={{ width: `${volumePercent}%` }} />
                </div>
                <input
                  type="range"
                  className={styles.volumeInput}
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value))
                    if (muted && Number(e.target.value) > 0) {
                      toggleMute()
                    }
                  }}
                  aria-label="Громкость"
                />
              </div>
            </div>
            <button type="button" className={styles.closeButton} onClick={closePlayer} aria-label="Свернуть плеер" title="Свернуть">
              <FiX size={18} />
            </button>
          </div>
          <span className={styles.timeText}>{formatTime(duration)}</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onCanPlay={handleCanPlay}
        onEnded={() => {
          const { repeat } = useAudioStore.getState()
          if (repeat) {
            const audio = audioRef.current
            if (audio) {
              audio.currentTime = 0
              setCurrentTime(0)
              setProgress(0)
              void audio.play().catch(() => { })
            }
            return
          }
          nextTrack()
        }}
      />
    </div>
  )
}

function formatTime(value: number) {
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}