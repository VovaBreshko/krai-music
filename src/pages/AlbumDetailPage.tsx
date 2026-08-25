import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { albumsData } from '../cms/data'
import { useAudioStore } from '../store/audioStore'
import styles from './AlbumDetailPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { FiArrowLeft, FiPlay, FiPause, FiDisc, FiInfo, FiX } from 'react-icons/fi'
import type { Track } from '../types/content'
import { Media } from '../shared/ui/Media'
import { TrackTitle } from '../shared/ui/TrackTitle'
import { hasTitleTag } from '../shared/lib/titleTag'
import { makeDeeperState, makeBackTargetState, backLinkLabel, type BackLinkState } from '../shared/lib/backNav'

function formatDate(dateString?: string): string {
  if (!dateString) return 'Дата не указана'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

function Equalizer() {
  return (
    <span className={styles.eq} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

export default function AlbumDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const [infoOpen, setInfoOpen] = useState(false)

  // Заголовок и кнопка «инфо»: центр иконки выравнивается по оптическому центру
  // отрисованного текста заголовка (см. эффект ниже).
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const infoBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!infoOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setInfoOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [infoOpen])

  // Навигационная цепочка: читаем откуда пришли и куда нужно вернуться
  const navState = useMemo(() => (location.state as BackLinkState | null) ?? null, [location.state])
  // Куда ведёт кнопка «назад» — ближайшая предыдущая страница
  const backTo = navState?.from
  // Состояние, которое передаём этой странице при возврате (её кнопка «назад» пойдёт дальше, к origin)
  const backState = makeBackTargetState(navState)
  // Состояние для переходов вглубь (к артистам) — сохраняем origin цепочки
  const deepState = makeDeeperState(location, navState)

  const playTrack = useAudioStore((state) => state.playTrack)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const togglePlay = useAudioStore((state) => state.togglePlay)

  const album = useMemo(
    () => albumsData.find((entry) => entry.id === id || entry.title.toLowerCase() === id?.toLowerCase()),
    [id],
  )

  if (!album) {
    return (
      <section className={styles.page}>
        <Seo title="Альбом не найден" description="Запрашиваемый альбом не найден." />
        <motion.p className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          Альбом не найден.
        </motion.p>
      </section>
    )
  }

  const tracks = album.tracks ?? []
  const isCurrent = (track: Track) => currentTrack?.id === track.id
  const allActive = currentTrack != null && tracks.some(isCurrent)

  const handlePlayPause = (track: Track) => {
    if (isCurrent(track)) {
      togglePlay()
    } else {
      playTrack(track, tracks)
    }
  }

  const handlePlayAll = () => {
    if (tracks.length === 0) return
    if (allActive && isPlaying) {
      togglePlay()
      return
    }
    const first = tracks.find((track) => !isCurrent(track)) ?? tracks[0]
    playTrack(first, tracks)
  }
return (
    <>
      <Seo title={album.title} description={`${album.title} — альбом Kray Music.`} />
      <section className={styles.page}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Link to={backTo ?? '/radio'} state={backState} className={styles.backLink}>
            <FiArrowLeft />
            <span>{backTo ? backLinkLabel(backTo) : 'К радио'}</span>
          </Link>
        </motion.div>

        <motion.header
          className={styles.hero}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
        >
          <div className={styles.coverWrap}>
            <Media src={album.cover} alt={album.title} className={styles.cover} />
          </div>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>
              <FiDisc size={15} />
              Альбом
            </p>
            <div className={styles.titleRow}>
              <h1 ref={titleRef}>{album.title}</h1>
              {album.description && (
                <button
                  ref={infoBtnRef}
                  type="button"
                  className={styles.infoButton}
                  onClick={() => setInfoOpen(true)}
                  aria-label="Подробнее об альбоме"
                  title="Подробнее об альбоме"
                >
                  <FiInfo aria-hidden="true" />
                </button>
              )}
            </div>
            <p className={styles.authors}>
              {album.authors.map((author, index) => (
                <span key={author.id}>
                  <Link to={`/artists/${author.id}`} state={deepState} className={styles.authorLink}>
                    {author.nickname}
                  </Link>
                  {index < album.authors.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </p>
            <p className={styles.meta}>
              {tracks.length} {pluralize(tracks.length, 'трек', 'трека', 'треков')} · {formatDate(album.releaseDate)}
            </p>
            <button type="button" className={styles.playAllBtn} onClick={handlePlayAll}>
              {allActive && isPlaying ? <FiPause /> : <FiPlay />}
              {allActive && isPlaying ? 'Пауза' : 'Слушать все'}
            </button>
          </div>
        </motion.header>

        <section className={styles.tracksSection}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Треки</p>
              <h2>Список треков</h2>
            </div>
          </header>

          {tracks.length > 0 ? (
            <div className={styles.trackList}>
              {tracks.map((track, index) => {
                const active = isCurrent(track)
                return (
                  <motion.div
                    key={track.id}
                    className={`${styles.trackRow} ${active ? styles.trackRowActive : ''}`}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.4, delay: reduceMotion ? 0 : (index % 8) * 0.04, ease: 'easeOut' }}
                    onClick={() => handlePlayPause(track)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handlePlayPause(track)
                      }
                    }}
                  >
                    <div className={styles.trackIndex}>
                      {active && isPlaying ? <Equalizer /> : <span>{index + 1}</span>}
                    </div>
                    <div className={styles.trackMain}>
                      <Media src={track.cover} alt="" className={styles.trackCover} lazy />
                      <div className={styles.trackText}>
                        <p className={styles.trackTitle} data-tagged={hasTitleTag(track.title)}><TrackTitle title={track.title} /></p>
                        <p className={styles.trackAuthors}>
                          {track.authors.map((author, authorIndex) => (
                              <span key={author.id}>
                                <Link
                                  to={`/artists/${author.id}`}
                                  state={deepState}
                                  className={styles.trackAuthorLink}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {author.nickname}
                                </Link>
                                {authorIndex < track.authors.length - 1 && ', '}
                              </span>
                            ))}
                        </p>
                      </div>
                    </div>
                    <span className={styles.trackDuration}>{formatDate(track.releaseDate)}</span>
                    <span className={styles.trackAction}>
                      {active && isPlaying ? <FiPause className={styles.pauseIcon} size={15} /> : <FiPlay className={styles.playIcon} size={15} />}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <p className={styles.empty}>В этом альбоме пока нет треков.</p>
          )}
        </section>

        <AnimatePresence>
          {infoOpen && (
            <motion.div
              className={styles.modalOverlay}
              role="presentation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInfoOpen(false)}
            >
              <motion.div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-label="Описание альбома"
                initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.97 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.modalHeader}>
                  <h2>{album.title}</h2>
                  <button
                    type="button"
                    className={styles.modalClose}
                    onClick={() => setInfoOpen(false)}
                    aria-label="Закрыть"
                  >
                    <FiX aria-hidden="true" />
                  </button>
                </div>
                <p>{album.description}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}