import { Link, useRouteError } from 'react-router-dom'
import styles from './ErrorPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { motion } from 'framer-motion'
import { FiRefreshCw, FiHome } from 'react-icons/fi'

type RouteError = {
  status?: number
  statusText?: string
  data?: unknown
  message?: string
}

export default function ErrorPage() {
  const error = useRouteError() as RouteError | undefined

  const status = typeof error?.status === 'number' ? error.status : 500
  const isNotFound = status === 404

  const title = isNotFound ? 'Страница не найдена' : 'Что-то пошло не так'
  const message = isNotFound
    ? 'Похоже, эта страница не существует или была перемещена. Попробуйте вернуться на главную или обновить страницу.'
    : 'Произошла непредвиденная ошибка. Попробуйте обновить страницу — если проблема повторится, загляните к нам позже.'

  return (
    <>
      <Seo title={title} description={`${title} — Kray Music.`} />
      <section className={styles.page}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className={styles.eyebrow}>{isNotFound ? '404' : 'Ой!'}</p>
          <h1>{title}</h1>
          <p className={styles.message}>{message}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.link} onClick={() => window.location.reload()}>
              <FiRefreshCw aria-hidden="true" />
              Обновить страницу
            </button>
            <Link to="/" className={styles.homeLink}>
              <FiHome aria-hidden="true" />
              На главную
            </Link>
          </div>
        </motion.div>
      </section>
    </>
  )
}
