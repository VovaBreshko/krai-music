import { useMemo, useRef, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import { artistsData, albumsData, tracksData } from '../cms/data'
import { useAudioStore } from '../store/audioStore'
import styles from './ArtistDetailPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { motion, useReducedMotion } from 'framer-motion'
import { FiArrowLeft, FiPlay, FiPause, FiChevronLeft, FiChevronRight, FiDisc } from 'react-icons/fi'
import type { Track, Album } from '../types/content'
import { Media } from '../shared/ui/Media'
import { ExpandableText } from '../shared/ui/ExpandableText'
import { TrackTitle } from '../shared/ui/TrackTitle'
import { hasTitleTag } from '../shared/lib/titleTag'
import { makeDeeperState, makeBackTargetState, backLinkLabel, type BackLinkState } from '../shared/lib/backNav'
import { isFirstItemVisible, scrollListToStart } from '../shared/lib/paginationScroll'
import { SOCIAL_META } from '../shared/lib/socials'

function formatDate(dateString?: string): string {
  if (!dateString) return 'Дата не указана'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}.${month}.${year}`
}

// Анимированный эквалайзер — как на страницах радио и альбома
function Equalizer() {
  return (
    <span className={styles.eq} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

export default function ArtistDetailPage() {
  const { id } = useParams()
  const location = useLocation()
  // Навигационная цепочка: откуда пришли, куда вернуться и как восстановить
  // исходный список артистов (страница/поиск).
  const navState = useMemo(
    () => (location.state as BackLinkState | null) ?? null,
    [location.state],
  )
  // Куда ведёт кнопка «назад» — ближайшая предыдущая страница
  const backTo = navState?.from
  // Состояние, которое передаём этой странице при возврате (её кнопка «назад» пойдёт дальше, к origin)
  const backState = makeBackTargetState(navState)
  // Состояние для переходов вглубь (к альбомам и артистам-соисполнителям)
  const deepState = makeDeeperState(location, navState)
  const [page, setPage] = useState(1)
  const listRef = useRef<HTMLDivElement>(null)
  const goToPage = (next: (value: number) => number) => {
    // Скроллим к первому элементу только если он сейчас не виден (пользователь проматывал)
    const list = listRef.current
    const shouldScroll = list ? !isFirstItemVisible(list) : false
    setPage(next)
    if (shouldScroll) {
      requestAnimationFrame(() => {
        scrollListToStart(listRef.current)
      })
    }
  }
  const playTrack = useAudioStore((state) => state.playTrack)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const togglePlay = useAudioStore((state) => state.togglePlay)
  const reduceMotion = useReducedMotion()

  const artist = useMemo(() => artistsData.find((entry) => entry.id === id), [id])

  const artistTracks = useMemo(() => {
    if (!artist) return []
    return tracksData.filter((track) =>
      track.authors.some((author) => author.id === artist.id)
    )
  }, [artist])

  const artistAlbums = useMemo(() => {
    if (!artist) return [] as Album[]
    return albumsData.filter((album) =>
      album.authors.some((author) => author.id === artist.id)
    )
  }, [artist])

  const featuredTrack = artist?.featuredTrack ?? null
  const featuredAlbum = artist?.featuredAlbum ?? null
  const featuredActive = featuredTrack != null && currentTrack?.id === featuredTrack.id

  const perPage = 4
  const totalPages = Math.max(1, Math.ceil(artistTracks.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const pageTracks = artistTracks.slice((currentPage - 1) * perPage, currentPage * perPage)

  const isCurrent = (track: Track) => currentTrack?.id === track.id

  const handlePlayPause = (track: Track) => {
    if (isCurrent(track)) {
      togglePlay()
      return
    }
    const nextQueue = artistTracks.length > 0 ? artistTracks : [track]
    playTrack(track, nextQueue)
  }

  if (!artist) {
    return (
      <motion.div
        className={styles.empty}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        Артист не найден.
      </motion.div>
    )
  }

  const socials = artist.socials ?? []
  const videos = artist.videos ?? []

  return (
    <>
      <Seo title={artist.nickname} description={`${artist.nickname} — артист Kray Music.`} />
      <section className={styles.page}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Link
            to={backTo ?? '/artists'}
            state={backState}
            className={styles.backLink}
          >
            <FiArrowLeft />
            <span>{backLinkLabel(backTo ?? '/artists')}</span>
          </Link>
        </motion.div>
        <motion.section
          className={styles.hero}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: 0.06 }}
        >
          <Media
            src={artist.squareImage || artist.verticalImage}
            alt={artist.nickname}
            className={styles.heroImage}
            wrapClassName={styles.heroImageWrap}
          />
          <div>
            <p className={styles.eyebrow}>Профиль артиста</p>
            <h1>{artist.nickname}</h1>
            <ExpandableText text={artist.biography} lines={5} />
            <div className={styles.socials}>
              {socials.map((social, index) => {
                const meta = social.type ? SOCIAL_META[social.type] : undefined
                const Icon = meta?.Icon
                const label = social.label?.trim() || meta?.defaultLabel || 'Ссылка'
                const key = `${label}-${social.url}-${index}`
                return Icon ? (
                  <a
                    key={key}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.socialIcon}
                    title={label}
                    aria-label={label}
                  >
                    <Icon aria-hidden="true" />
                  </a>
                ) : (
                  <a key={key} href={social.url} target="_blank" rel="noreferrer">
                    {social.label}
                  </a>
                )
              })}
            </div>
          </div>
        </motion.section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Видео</p>
              <h2>Клипы</h2>
            </div>
          </div>
          {videos.length > 0 ? (
            <Swiper
              className={styles.swiper}
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              spaceBetween={16}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
            >
              {videos.map((video, videoIndex) => (
                <SwiperSlide key={video.title} className={styles.swiperSlide}>
                  <motion.article
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.45, delay: reduceMotion ? 0 : (videoIndex % 3) * 0.06, ease: 'easeOut' }}
                    className={styles.card}
                  >
                    <a href={video.url} target="_blank" rel="noreferrer">
                      <Media src={video.cover} alt={video.title} className={styles.image} />
                    </a>
                    <h3>{video.title}</h3>
                    <ExpandableText text={video.description} lines={3} />
                    <a href={video.url} target="_blank" rel="noreferrer">
                      <button type="button" className={styles.secondaryButton}>
                        <FiPlay />
                        Смотреть
                      </button>
                    </a>
                  </motion.article>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className={styles.empty}>У этого артиста пока нет клипов.</p>
          )}
        </section>

        <section className={styles.section}>
          <div className={`${styles.trackLayout} ${featuredTrack ? '' : styles.trackLayoutEmpty}`}>
            {!featuredTrack && (
              <div className={styles.trackHeader}>
                <p className={styles.eyebrow}>Треки</p>
                <h2>Список треков</h2>
              </div>
            )}
            <div className={styles.trackColumn}>
              {featuredTrack && (
                <div className={styles.trackHeader}>
                  <p className={styles.eyebrow}>Треки</p>
                  <h2>Список треков</h2>
                </div>
              )}
              {pageTracks.length > 0 ? (
                <>
                  <div className={styles.trackList} ref={listRef}>
                    {pageTracks.map((track, index) => {
                      const active = isCurrent(track)
                      return (
                        <motion.div
                          key={track.id}
                          className={`${styles.trackCard} ${active ? styles.trackCardActive : ''}`}
                          initial={{ opacity: 0, y: 14 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-30px' }}
                          transition={{ duration: 0.45, delay: reduceMotion ? 0 : (index % 4) * 0.05, ease: 'easeOut' }}
                        >
                          <div className={styles.trackCoverWrap}>
                            <Media src={track.cover} alt={track.title} className={styles.trackCover} fill />
                            {active && isPlaying ? (
                              <span className={styles.coverEq} aria-hidden="true">
                                <Equalizer />
                              </span>
                            ) : null}
                          </div>
                          <div>
                            <h3 data-tagged={hasTitleTag(track.title)}><TrackTitle title={track.title} /></h3>
                            <div className={styles.trackAuthors}>
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
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`${styles.playButton} ${active ? styles.playButtonActive : ''}`}
                            onClick={() => handlePlayPause(track)}
                            aria-label={active && isPlaying ? 'Пауза' : 'Слушать'}
                          >
                            {active && isPlaying ? <FiPause /> : <FiPlay />}
                          </button>
                        </motion.div>
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
                      disabled={currentPage === 1} aria-label="Назад"
                    >
                      <FiChevronLeft size={18} />
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                      type="button"
                      onClick={() => goToPage((value) => Math.min(totalPages, value + 1))}
                      disabled={currentPage === totalPages} aria-label="Вперёд"
                    >
                      <FiChevronRight size={18} />
                    </button>
                  </motion.div>
                </>
              ) : (
                <p className={styles.emptyTracks}>У этого артиста пока нет треков.</p>
              )}
            </div>

            <motion.div
              className={`${styles.featuredTrackCard} ${featuredActive ? styles.featuredTrackCardActive : ''}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div className={styles.featuredTrackHeader}>
                <p className={styles.eyebrow}>Новый релиз</p>
              </div>
              {featuredAlbum ? (
                <>
                  <Link
                    to={`/albums/${featuredAlbum.id}`}
                    state={deepState}
                    className={styles.featuredTrackCoverButton}
                    aria-label={`Открыть альбом: ${featuredAlbum.title}`}
                  >
                    <Media
                      src={featuredAlbum.cover}
                      alt={featuredAlbum.title}
                      className={styles.featuredTrackCover}
                    />
                  </Link>
                  <div className={styles.featuredTrackInfo}>
                    <h3>
                      <Link to={`/albums/${featuredAlbum.id}`} state={deepState} className={styles.albumTitleLink}>
                        {featuredAlbum.title}
                      </Link>
                    </h3>
                    <div className={styles.albumAuthors}>
                      {featuredAlbum.authors.map((author, authorIndex) => (
                        <span key={author.id}>
                          <Link to={`/artists/${author.id}`} state={deepState} className={styles.albumAuthorLink}>
                            {author.nickname}
                          </Link>
                          {authorIndex < featuredAlbum.authors.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                    <p>Дата релиза: {formatDate(featuredAlbum.releaseDate)}</p>
                    <ExpandableText text={featuredAlbum.description} lines={5} />
                    <Link to={`/albums/${featuredAlbum.id}`} state={deepState} className={styles.albumOpenLink}>
                      Открыть альбом
                    </Link>
                  </div>
                </>
              ) : featuredTrack ? (
                <>
                  <button
                    type="button"
                    className={styles.featuredTrackCoverButton}
                    onClick={() => handlePlayPause(featuredTrack)}
                    aria-label={featuredActive && isPlaying ? 'Пауза' : 'Слушать'}
                  >
                    <Media
                      src={featuredTrack.cover}
                      alt={featuredTrack.title}
                      className={styles.featuredTrackCover}
                    />
                    {featuredActive && isPlaying ? (
                      <span className={styles.featuredCoverEq} aria-hidden="true">
                        <Equalizer />
                      </span>
                    ) : null}
                  </button>
                  <div className={styles.featuredTrackInfo}>
                    <h3><TrackTitle title={featuredTrack.title} /></h3>
                    <div className={styles.albumAuthors}>
                      {featuredTrack.authors.map((author, authorIndex) => (
                        <span key={author.id}>
                          <Link to={`/artists/${author.id}`} state={deepState} className={styles.albumAuthorLink}>
                            {author.nickname}
                          </Link>
                          {authorIndex < featuredTrack.authors.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                    <p>Дата релиза: {formatDate(featuredTrack.releaseDate)}</p>
                    <ExpandableText text={featuredTrack.description} lines={5} />
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => handlePlayPause(featuredTrack)}
                    >
                      {featuredActive && isPlaying ? <FiPause /> : <FiPlay />}
                      {featuredActive && isPlaying ? 'Пауза' : 'Слушать'}
                    </button>
                  </div>
                </>
              ) : (
                <p>Пока нет доступных релизов.</p>
              )}
            </motion.div>
          </div>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>
                <FiDisc size={14} />
                Альбомы
              </p>
              <h2>Альбомы артиста</h2>
            </div>
          </div>
          {artistAlbums.length > 0 ? (
            <div className={styles.albumGrid}>
              {artistAlbums.map((album, index) => (
                <motion.article
                  key={album.id}
                  className={styles.albumCard}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: reduceMotion ? 0 : (index % 4) * 0.05, ease: 'easeOut' }}
                >
                  <Link to={`/albums/${album.id}`} state={deepState} className={styles.albumCoverLink}>
                    <Media src={album.cover} alt={album.title} className={styles.albumCover} lazy />
                  </Link>
                  <div className={styles.albumBody}>
                    <h3>
                      <Link to={`/albums/${album.id}`} state={deepState} className={styles.albumTitleLink}>
                        {album.title}
                      </Link>
                    </h3>
                    <p className={styles.albumMeta}>
                      {album.tracks.length} {album.tracks.length === 1 ? 'трек' : album.tracks.length < 5 ? 'трека' : 'треков'} ·{' '}
                      {formatDate(album.releaseDate)}
                    </p>
                    <Link to={`/albums/${album.id}`} state={deepState} className={styles.albumOpenLink}>
                      Открыть альбом
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>У этого артиста пока нет альбомов.</p>
          )}
        </section>
      </section>
    </>
  )
}