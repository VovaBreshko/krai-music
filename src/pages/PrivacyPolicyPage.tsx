import { motion } from 'framer-motion'
import styles from '../shared/ui/Legal.module.css'
import { Seo } from '../shared/ui/Seo'
import { RichText } from '../shared/ui/RichText'
import { privacyPolicyContent, contactData } from '../cms/data'

export default function PrivacyPolicyPage() {
  const text = privacyPolicyContent.replaceAll('{{email}}', contactData.email)

  return (
    <>
      <Seo
        title="Политика конфиденциальности"
        description="Политика конфиденциальности сайта КРАЙ MUSIC: мы не собираем персональные данные, не используем cookie, формы и аналитику."
      />
      <section className={styles.page}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className={styles.eyebrow}>Документы</p>
          <h1>Политика конфиденциальности</h1>
          <p className={styles.subtitle}>
            Коротко: Сайт «КРАЙ MUSIC» не собирает персональные данные посетителей — без форм, cookie и аналитики.
          </p>
          <p className={styles.lastUpdated}>Редакция от 20 августа 2026 года</p>
        </motion.div>

        <RichText text={text} className={styles.document} />
      </section>
    </>
  )
}
