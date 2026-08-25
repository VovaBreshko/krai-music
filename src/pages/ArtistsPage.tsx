import { useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { artistsData } from '../cms/data'
import styles from './ArtistsPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { Media } from '../shared/ui/Media'
import { isFirstItemVisible, scrollListToStart } from '../shared/lib/paginationScroll'
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

// Параметры состояния, которые передаются на страницу артиста и возвращаются
// обратно по нажатию «К артистам», чтобы восстановить просматриваемую страницу
// и строку поиска.
interface ArtistsBackState {
  from?: string
  origin?: string
  fromArtistsPage?: boolean
  page?: number
  query?: string
}

// «Широкий экран»: на десктопе сетка 3 колонки, 6 артистов = 2 ряда.
// На узких экранах показываем 4 артиста на страницу.
function subscribeToDesktop(callback: () => void): () => void {
  const mql = window.matchMedia('(min-width: 1024px)')
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getDesktopSnapshot(): boolean {
  return window.matchMedia('(min-width: 1024px)').matches
}

function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeToDesktop, getDesktopSnapshot, () => false)
}

export default function ArtistsPage() {
  const reduceMotion = useReducedMotion()
  const isDesktop = useIsDesktop()
  const location = useLocation()
  // Восстанавливаем страницу и поиск, если пришли обратно со страницы артиста
  const backState = useMemo(() => (location.state as ArtistsBackState | null) ?? null, [location.state])
  const [query, setQuery] = useState(backState?.query ?? '')
  const [page, setPage] = useState(backState?.page && backState.page > 0 ? backState.page : 1)
  const perPage = isDesktop ? 6 : 4
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

  const filteredArtists = useMemo(() => {
    const sorted = [...artistsData].sort((left, right) => left.nickname.localeCompare(right.nickname))
    return sorted.filter((artist) => artist.nickname.toLowerCase().includes(query.toLowerCase()))
  }, [query])

  const totalPages = Math.max(1, Math.ceil(filteredArtists.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const pageArtists = filteredArtists.slice((currentPage - 1) * perPage, currentPage * perPage)

  // Прокидываем текущую страницу/поиск на страницу артиста, чтобы вернуться обратно
  const path = location.pathname + location.search
  const backStateProp: ArtistsBackState = { from: path, origin: path, fromArtistsPage: true, page: currentPage, query }

  return (
    <>
      <Seo title="Артисты" description="Изучайте артистов Kray Music и открывайте новых исполнителей." />
      <section className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div>
          <p className={styles.eyebrow}>Артисты</p>
          <h1>Избранные голоса</h1>
          <p className={styles.subtitle}>Изучайте артистов лейбла Край и открывайте новые имена — у каждого свой звук и история.</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          placeholder="Поиск артистов"
          className={styles.input}
          aria-label="Поиск артистов"
        />
      </motion.div>
      <div className={styles.grid} ref={listRef}>
        {pageArtists.map((artist, index) => (
          <motion.article
            key={artist.id}
            className={styles.card}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : (index % 3) * 0.06, ease: 'easeOut' }}
          >
            <Link to={`/artists/${artist.id}`} state={backStateProp}><Media src={artist.verticalImage} alt={artist.nickname} className={styles.image} /></Link>
            <h2>{artist.nickname}</h2>
            <p className={styles.cardText}>{artist.biography}</p>
            <Link to={`/artists/${artist.id}`} state={backStateProp} className={styles.cardLink}>
              Открыть профиль
              <FiArrowRight />
            </Link>
          </motion.article>
        ))}
      </div>
      <motion.div
        className={styles.pagination}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.12 }}
      >
        <button type="button" onClick={() => goToPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Назад">
          <FiChevronLeft size={18} />
        </button>
        <span>{currentPage} / {totalPages}</span>
        <button type="button" onClick={() => goToPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="Вперёд">
          <FiChevronRight size={18} />
        </button>
      </motion.div>
    </section>
    </>
  )
}
