import { motion, useReducedMotion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { useAudioStore } from '../store/audioStore'
import { homepageContentData, artistsData, albumsData, tracksData, eventsData } from '../cms/data'
import styles from './HomePage.module.css'
import logo from '../assets/logo.png'
import { Link, useLocation } from 'react-router-dom'
import { Seo } from '../shared/ui/Seo'
import { makeBackLinkState } from '../shared/lib/backNav'
import { FiArrowRight, FiCalendar, FiMapPin, FiPlay, FiPause, FiHeadphones } from 'react-icons/fi'
import { Media } from '../shared/ui/Media'
import { TrackTitle } from '../shared/ui/TrackTitle'
import { hasTitleTag } from '../shared/lib/titleTag'
import type { Track } from '../types/content'

function formatDate(dateString?: string): string {
  if (!dateString) return 'Дата не указана';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

const SHORT_MONTHS = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

function formatDayMonth(dateString?: string): { day: string; month: string } {
  if (!dateString) return { day: '--', month: '' }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return { day: '--', month: '' }
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: SHORT_MONTHS[date.getMonth()],
  }
}

// Анимированный эквалайзер (как на страницах радио и альбома)
function Equalizer() {
  return (
    <span className={styles.eq} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

const EQ_HEIGHTS = [22, 40, 30, 48, 34, 54, 26, 42, 36, 50, 30, 44]
const MARQUEE_ITEMS = ['Новые имена', 'Красноярск', 'Музыкальный лейбл', 'Krai Music']
const MARQUEE_CONTENT = Array.from({ length: 8 }, () => MARQUEE_ITEMS).flat()

interface SectionHeadProps {
  eyebrow: string
  title: string
  to: string
  linkLabel: string
}

function SectionHead({ eyebrow, title, to, linkLabel }: SectionHeadProps) {
  return (
    <div className={styles.sectionHeader}>
      <div>
        <p className={styles.sectionEyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <Link to={to} className={styles.sectionLink}>
        {linkLabel}
        <FiArrowRight />
      </Link>
    </div>
  )
}

export default function HomePage() {
  const location = useLocation()
  // Источник перехода — чтобы со страницы артиста/альбома можно было вернуться домой
  const backState = makeBackLinkState(location)
  const playTrack = useAudioStore((state) => state.playTrack)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const togglePlay = useAudioStore((state) => state.togglePlay)
  const queue = useAudioStore((state) => state.queue)
  const reduceMotion = useReducedMotion()

  const { heroTitle, heroSubtitle, featuredArtists, featuredAlbums, featuredTracks, featuredEvents } = homepageContentData

  const displayArtists = featuredArtists.length > 0 ? featuredArtists : artistsData.slice(0, 3)
  const displayAlbums = featuredAlbums.length > 0 ? featuredAlbums : albumsData.slice(0, 3)
  const displayTracks = featuredTracks.length > 0 ? featuredTracks : tracksData.slice(0, 3)
  const displayEvents = featuredEvents.length > 0 ? featuredEvents : eventsData.slice(0, 3)

  const isCurrent = (track: Track) => currentTrack?.id === track.id

  const handlePlayPause = (track: Track) => {
    if (isCurrent(track)) {
      togglePlay()
      return
    }
    playTrack(track, queue)
  }

  return (
    <>
      <Seo title="Главная" description="Kray Music — музыкальный лейбл, который помогает открывать новых артистов и слушать свежие релизы." />
      <section className={styles.page}>
        <section className={styles.hero}>
          <span className={styles.heroGlow} aria-hidden="true" />
          <span className={styles.heroGlowSecond} aria-hidden="true" />

          <div className={styles.heroContent}>
            <motion.p
              className={styles.eyebrow}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.05 }}
            >
              Музыкальный лейбл из Красноярска
            </motion.p>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.12 }}
            >
              {heroTitle}
            </motion.h1>
            <motion.span
              className={styles.titleAccent}
              aria-hidden="true"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
            />
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.28 }}
            >
              <span className={styles.brand}>
                «
                <span className={styles.brandKray}>Край</span>
                <span className={styles.brandMusic}>Music</span>
                »
              </span>
              {heroSubtitle}
            </motion.p>
            <motion.div
              className={styles.heroActions}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.36 }}
            >
              <Link to="/artists" className={styles.primaryLink}>
                Наши артисты
                <FiArrowRight />
              </Link>
              <Link to="/radio" className={styles.secondaryLink}>
                <FiHeadphones />
                Слушать релизы
              </Link>
            </motion.div>
          </div>

          <div className={styles.heroArt} aria-hidden="true">
            <span className={styles.vinylRing} />
            <div className={styles.vinyl}>
              <span className={styles.vinylLabel}>
                <img src={logo} alt="" className={styles.vinylLogo} />
              </span>
            </div>
            <motion.div
              className={styles.onAir}
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className={styles.onAirDot} />
              <span>В ЭФИРЕ</span>
            </motion.div>
            <div className={styles.equalizer}>
              {EQ_HEIGHTS.map((height, index) => (
                <motion.span
                  key={index}
                  className={styles.eqBar}
                  style={{ height }}
                  animate={reduceMotion ? undefined : { scaleY: [0.2, 1, 0.45, 0.8, 0.2] }}
                  transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut', delay: index * 0.09 }}
                />
              ))}
            </div>
          </div>
        </section>

        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {MARQUEE_CONTENT.map((item, index) => (
              <span key={index} className={styles.marqueeItem}>
                <span className={styles.marqueeDot} />
                {item}
              </span>
            ))}
          </div>
        </div>

        <section className={styles.section}>
          <SectionHead eyebrow="Лейбл" title="Наши артисты" to="/artists" linkLabel="Все артисты" />
          <Swiper
            className={styles.swiper}
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={16}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          >
            {displayArtists.map((artist) => (
              <SwiperSlide key={artist.id} className={styles.swiperSlide}>
                <motion.article
                  className={styles.card}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className={styles.cardMedia}>
                    <Link to={`/artists/${artist.id}`} state={backState} className={styles.cardImageLink}>
                      <Media src={artist.verticalImage} alt={artist.nickname} className={styles.artistImage} lazy />
                    </Link>
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{artist.nickname}</h3>
                    <p className={styles.cardText}>{artist.biography}</p>
                    <Link to={`/artists/${artist.id}`} state={backState} className={styles.cardLink}>
                      Открыть профиль
                      <FiArrowRight />
                    </Link>
                  </div>
                </motion.article>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        <section className={styles.section}>
          <SectionHead eyebrow="Релизы" title="Недавние релизы" to="/radio" linkLabel="Все релизы" />
          <Swiper
            className={styles.swiper}
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={16}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          >
            {displayAlbums.map((album) => (
              <SwiperSlide key={album.id} className={styles.swiperSlide}>
                <motion.article
                  className={styles.card}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <div className={styles.cardMedia}>
                    <Link to={`/albums/${album.id}`} state={backState} className={styles.cardImageLink}>
                      <Media src={album.cover} alt={album.title} className={styles.trackImage} lazy />
                    </Link>
                    <span className={styles.chip}>Альбом</span>
                    <Link
                      to={`/albums/${album.id}`}
                      state={backState}
                      className={styles.openOverlay}
                      aria-label={`Открыть альбом: ${album.title}`}
                    >
                      <FiArrowRight />
                    </Link>
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{album.title}</h3>
                    <p className={styles.cardText}>
                      {album.authors.map((author, index) => (
                        <span key={author.id}>
                          <Link to={`/artists/${author.id}`} state={backState} className={styles.authorLink}>
                            {author.nickname}
                          </Link>
                          {index < album.authors.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </p>
                  </div>
                </motion.article>
              </SwiperSlide>
            ))}
            {displayTracks.map((track) => {
              const active = isCurrent(track)
              return (
                <SwiperSlide key={track.id} className={styles.swiperSlide}>
                  <motion.article
                    className={`${styles.card} ${active ? styles.cardActive : ''}`}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <div className={styles.cardMedia}>
                      <Media src={track.cover} alt={track.title} className={styles.trackImage} lazy />
                      {active && isPlaying ? (
                        <span className={styles.coverEq} aria-hidden="true">
                          <Equalizer />
                        </span>
                      ) : null}
                      <span className={styles.chip}>Сингл</span>
                      <button
                        type="button"
                        className={styles.playOverlay}
                        onClick={() => handlePlayPause(track)}
                        aria-label={active && isPlaying ? `Пауза: ${track.title}` : `Слушать: ${track.title}`}
                      >
                        {active && isPlaying ? <FiPause className={styles.playOverlayPauseIcon} /> : <FiPlay className={styles.playOverlayPlayIcon} />}
                      </button>
                    </div>
                    <div className={styles.cardBody}>
                      <h3 className={styles.trackTitle} data-tagged={hasTitleTag(track.title)}><TrackTitle title={track.title} /></h3>
                      <p className={styles.cardText}>
                        {track.authors.map((author, index) => (
                          <span key={author.id}>
                            <Link to={`/artists/${author.id}`} state={backState} className={styles.authorLink}>
                              {author.nickname}
                            </Link>
                            {index < track.authors.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    </div>
                  </motion.article>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </section>

        <section className={styles.section}>
          <SectionHead eyebrow="События" title="Мероприятия" to="/events" linkLabel="Все мероприятия" />
          <Swiper
            className={styles.swiper}
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={16}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{ 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          >
            {displayEvents.map((event) => {
              const { day, month } = formatDayMonth(event.date)
              return (
                <SwiperSlide key={event.id} className={styles.swiperSlide}>
                  <motion.article
                    className={styles.card}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    <div className={styles.cardMedia}>
                      <Media src={event.image} alt={event.title} className={styles.eventImage} lazy />
                      <span className={styles.dateBadge}>
                        <span className={styles.dateBadgeDay}>{day}</span>
                        <span className={styles.dateBadgeMonth}>{month}</span>
                      </span>
                    </div>
                    <div className={styles.cardBody}>
                      <h3>{event.title}</h3>
                      <p className={styles.cardText}>{event.description}</p>
                      <div className={styles.meta}>
                        <FiCalendar />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className={styles.meta}>
                        <FiMapPin />
                        <span>{event.location}</span>
                      </div>
                      <Link
                        to={{ pathname: '/events', hash: event.id }}
                        className={styles.eventDetailsBtn}
                        aria-label={`Подробнее о мероприятии: ${event.title}`}
                      >
                        Подробнее
                        <FiArrowRight />
                      </Link>
                    </div>
                  </motion.article>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </section>

        <section className={styles.cta}>
          <div>
            <p className={styles.eyebrow}>Радио лейбла</p>
            <h2>Готовы включить звук?</h2>
            <p>Соберите собственную подборку из свежих релизов Край Music и запустите проигрывание.</p>
          </div>
          <Link to="/radio" className={styles.primaryLink}>
            Открыть радио
            <FiArrowRight />
          </Link>
        </section>
      </section>
    </>
  )
}
