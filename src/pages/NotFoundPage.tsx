import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Страница не найдена" description="Запрашиваемая страница не найдена на Kray Music." />
      <section className={styles.page}>
        <motion.div
          style={{ display: 'grid', justifyItems: 'center', gap: '1.2rem', textAlign: 'center' }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className={styles.eyebrow}>404</p>
          <h1>Страница не найдена</h1>
          <p>Но вы можете найти вдохновение на радио КрайMusic!</p>
          <Link to="/radio" className={styles.link}>
            Поймать волну
            <FiArrowRight />
          </Link>
          <Link to="/" className={styles.homeLink}>На главную</Link>
        </motion.div>
      </section>
    </>
  )
}
