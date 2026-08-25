import { useMemo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { artistsData, tracksData, radioContentData } from '../cms/data'
import { useAudioStore } from '../store/audioStore'
import styles from './RadioPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { Link, useLocation } from 'react-router-dom'
import { Media } from '../shared/ui/Media'
import { TrackTitle } from '../shared/ui/TrackTitle'
import { hasTitleTag } from '../shared/lib/titleTag'
import { makeBackLinkState } from '../shared/lib/backNav'
import { isFirstItemVisible, scrollListToStart } from '../shared/lib/paginationScroll'
import logo from '../assets/logo.png'
import { FiPlay, FiPause, FiShuffle, FiRadio, FiChevronLeft, FiChevronRight, FiChevronDown, FiArrowRight } from 'react-icons/fi'
import type { Track, Album } from '../types/content'

function formatDate(dateString?: string): string {
  if (!dateString) return '—'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
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

export default function RadioPage() {
  const location = useLocation()
  // Источник перехода — чтобы со страницы артиста/альбома можно было вернуться в радио
  const backState = makeBackLinkState(location)
  const [filter, setFilter] = useState('Все')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterSearch, setFilterSearch] = useState('')
  const filterRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  // Закрываем дропдаун при клике вне его области
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const playTrack = useAudioStore((state) => state.playTrack)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const togglePlay = useAudioStore((state) => state.togglePlay)

  const artistFilters = useMemo(() => ['Все', ...artistsData.map((artist) => artist.nickname)], [])

  // Отфильтрованные по строке поиска варианты для дропдауна
  const filteredArtistOptions = useMemo(() => {
    const query = filterSearch.trim().toLowerCase()
    if (!query) return artistFilters
    return artistFilters.filter((name) => name.toLowerCase().includes(query))
  }, [artistFilters, filterSearch])

  const filteredTracks = useMemo(() => {
    if (filter === 'Все') return tracksData
    return tracksData.filter((track) =>
      track.authors.some((author) => author.nickname === filter)
    )
  }, [filter])

  // «Альбомы лейбла» — витрина-карусель, выбор задаётся в Decap CMS (content/radio.json)
  const labelAlbums = useMemo((): Album[] => {
    if (filter === 'Все') return radioContentData.albums
    return radioContentData.albums.filter((album) =>
      album.authors.some((author) => author.nickname === filter)
    )
  }, [filter])

  // Пагинация списка «Все треки» (как на странице артиста)
  const perPage = 8
  const totalPages = Math.max(1, Math.ceil(filteredTracks.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const pageTracks = filteredTracks.slice((currentPage - 1) * perPage, currentPage * perPage)

  const goToPage = (next: (value: number) => number) => {
    // Проверяем видимость первого элемента ДО смены страницы: если он виден —
    // прокручивать не нужно, если нет (пользователь проматывал) — скроллим к началу.
    const list = listRef.current
    const shouldScroll = list ? !isFirstItemVisible(list) : false
    setPage(next)
    if (shouldScroll) {
      requestAnimationFrame(() => {
        scrollListToStart(listRef.current)
      })
    }
  }

  const isCurrent = (track: Track) => currentTrack?.id === track.id
  const firstTrack = filteredTracks[0]
  const playingSomething = isPlaying && currentTrack != null
  // Трек из текущей подборки уже выбран в плеере (играет или на паузе)
  const activeInList = currentTrack != null && filteredTracks.some(isCurrent)

  const handlePlay = (track: Track) => {
    playTrack(track, filteredTracks)
  }

  const handlePlayPause = (track: Track) => {
    if (isCurrent(track)) {
      togglePlay()
    } else {
      handlePlay(track)
    }
  }

  const handleShuffle = () => {
    const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5)
    if (shuffled.length > 0) {
      playTrack(shuffled[0], shuffled)
    }
  }

  const handleFilter = (value: string) => {
    setPage(1)
    setFilter(value)
  }

  return (
    <>
      <Seo title="Радио" description="Слушайте отобранную подборку Kray Music: релизы лейбла, фильтры по артистам и плейлисты на любой вкус." />
      <section className={styles.page}>
        {/* ===== Крупный баннер — визитная карточка радио ===== */}
        <motion.section
          className={styles.billboard}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={styles.billboardRing} aria-hidden="true" />
          <span className={styles.billboardRingSecond} aria-hidden="true" />

          <div className={styles.billboardContent}>
            <p className={styles.billboardKicker}>
              <FiRadio />
              Радио лейбла
            </p>
            <h1 className={styles.billboardTitle}>
              Поймай свою <span>волну</span>
            </h1>
            <p className={styles.billboardText}>
              Все релизы Край Music — в одном плейлисте. Фильтруйте подборку по артистам,
              запускайте её одним касанием или включите вперемешку.
            </p>
            <div className={styles.billboardActions}>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => (activeInList ? togglePlay() : firstTrack && handlePlay(firstTrack))}
                disabled={!firstTrack}
              >
                {activeInList && playingSomething ? <FiPause size={16} /> : <FiPlay size={16} />}
                {activeInList ? (playingSomething ? 'Пауза' : 'Слушать') : 'Слушать всё'}
              </button>
              <button type="button" className={styles.ghostBtn} onClick={handleShuffle} disabled={filteredTracks.length === 0}>
                <FiShuffle size={15} />
                Слушать вперемешку
              </button>
            </div>
          </div>

          <div className={styles.billboardArt} aria-hidden="true">
            <span className={styles.vinylRing} />
            <div className={styles.vinyl}>
              <span className={styles.vinylLabel}>
                <img src={logo} alt="" className={styles.vinylLogo} />
              </span>
            </div>
            <span className={styles.signalDot} />
            <div className={`${styles.eqBig} ${playingSomething ? styles.eqBigActive : ''}`}>
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </motion.section>

        {/* ===== Фильтр по артистам ===== */}
        <div className={styles.filters} ref={filterRef}>
          <button
            type="button"
            className={`${styles.filterTrigger} ${filterOpen ? styles.filterTriggerOpen : ''}`}
            onClick={() => {
              setFilterOpen((open) => !open)
              setFilterSearch('')
            }}
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
          >
            <span>{filter}</span>
            <FiChevronDown size={15} />
          </button>

          <AnimatePresence>
            {filterOpen && (
              <motion.div
                className={styles.filterDropdown}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
              >
              <input
                type="search"
                className={styles.filterSearch}
                placeholder="Поиск артиста…"
                value={filterSearch}
                onChange={(event) => setFilterSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setFilterOpen(false)
                }}
                autoFocus
              />
              <div className={styles.filterOptions} role="listbox" aria-label="Список артистов">
                {filteredArtistOptions.length > 0 ? (
                  filteredArtistOptions.map((entry) => (
                    <button
                      key={entry}
                      type="button"
                      className={entry === filter ? styles.filterOptionActive : ''}
                      onClick={() => {
                        handleFilter(entry)
                        setFilterOpen(false)
                      }}
                      role="option"
                      aria-selected={entry === filter}
                    >
                      {entry}
                    </button>
                  ))
                ) : (
                  <p className={styles.filterEmpty}>Никого не найдено</p>
                )}
              </div>
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===== Карусель альбомов лейбла ===== */}
        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>{filter === 'Все' ? 'Коллекция' : filter}</p>
              <h2 className={styles.sectionTitle}>Альбомы лейбла</h2>
            </div>
          </header>

          {labelAlbums.length > 0 ? (
            <Swiper
              className={styles.swiper}
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              spaceBetween={16}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{ 480: { slidesPerView: 2 }, 768: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
            >
              {labelAlbums.map((album, index) => (
                <SwiperSlide key={album.id} className={styles.swiperSlide}>
                  <motion.article
                    className={styles.albumCard}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: reduceMotion ? 0 : (index % 4) * 0.05, ease: 'easeOut' }}
                  >
                    <div className={styles.albumCoverWrap}>
                      <Media src={album.cover} alt={album.title} className={styles.albumCover} lazy />
                      <Link
                        to={`/albums/${album.id}`}
                        state={backState}
                        className={styles.albumPlay}
                        aria-label={`Открыть альбом: ${album.title}`}
                      >
                        <FiArrowRight size={18} />
                      </Link>
                    </div>
                    <h3 className={styles.albumTitle}>
                      <Link to={`/albums/${album.id}`} state={backState} className={styles.albumAuthorLink}>
                        {album.title}
                      </Link>
                    </h3>
                    <div className={styles.albumAuthors}>
                      {album.authors.map((author, authorIndex) => (
                        <span key={author.id}>
                          <Link to={`/artists/${author.id}`} state={backState} className={styles.albumAuthorLink}>
                            {author.nickname}
                          </Link>
                          {authorIndex < album.authors.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                    <p className={styles.albumMeta}>
                      Альбом · {formatDate(album.releaseDate)}
                    </p>
                  </motion.article>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className={styles.empty}>В этой подборке пока нет альбомов.</p>
          )}
        </section>

        {/* ===== Список треков ===== */}
        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Свежее</p>
              <h2 className={styles.sectionTitle}>Все треки</h2>
            </div>
          </header>

          {filteredTracks.length > 0 ? (
            <>
              <div className={styles.trackList} ref={listRef}>
                {pageTracks.map((track, index) => {
                  const active = isCurrent(track)
                  return (
                    <div
                      key={track.id}
                      className={`${styles.trackRow} ${active ? styles.trackRowActive : ''}`}
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
                        {active && isPlaying ? <Equalizer /> : <span>{((currentPage - 1) * perPage) + index + 1}</span>}
                      </div>
                      <div className={styles.trackMain}>
                        <Media src={track.cover} alt="" className={styles.trackCover} lazy />
                        <div className={styles.trackText}>
                          <p className={styles.trackTitle} data-tagged={hasTitleTag(track.title)}><TrackTitle title={track.title} /></p>
                          <div className={styles.trackAuthors}>
                            {track.authors.map((author, authorIndex) => (
                              <span key={author.id}>
                                <Link
                                  to={`/artists/${author.id}`}
                                  state={backState}
                                  className={styles.trackAuthorLink}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {author.nickname}
                                </Link>
                                {authorIndex < track.authors.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className={styles.trackDate}>{formatDate(track.releaseDate)}</span>
                      <span className={styles.trackAction}>
                        {active && isPlaying ? <FiPause className={styles.pauseIcon} size={15} /> : <FiPlay className={styles.playIcon} size={15} />}
                      </span>
                    </div>
                  )
                })}
              </div>

              <motion.div
                className={styles.pagination}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <button
                  type="button"
                  onClick={() => goToPage((value) => Math.max(1, value - 1))}
                  disabled={currentPage === 1}
                  aria-label="Предыдущая страница"
                >
                  <FiChevronLeft size={18} />
                </button>
                <span>
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => goToPage((value) => Math.min(totalPages, value + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Следующая страница"
                >
                  <FiChevronRight size={18} />
                </button>
              </motion.div>
            </>
          ) : (
            <p className={styles.empty}>В этой подборке пока нет треков.</p>
          )}
        </section>
      </section>
    </>
  )
}