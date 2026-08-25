import { motion } from 'framer-motion'
import styles from '../shared/ui/Legal.module.css'
import { Seo } from '../shared/ui/Seo'
import { RichText } from '../shared/ui/RichText'
import { useRulesContent, contactData } from '../cms/data'

export default function UseRulesPage() {
  const text = useRulesContent.replaceAll('{{email}}', contactData.email)

  return (
    <>
      <Seo
        title="Условия использования"
        description="Условия использования сайта КРАЙ MUSIC: правила прослушивания музыки, интеллектуальная собственность и внешние ссылки."
      />
      <section className={styles.page}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className={styles.eyebrow}>Документы</p>
          <h1>Условия использования</h1>
          <p className={styles.subtitle}>
            Правила пользования информационным сайтом «КРАЙ MUSIC» и его материалами.
          </p>
          <p className={styles.lastUpdated}>Редакция от 20 августа 2026 года</p>
        </motion.div>

        <RichText text={text} className={styles.document} />
      </section>
    </>
  )
}
