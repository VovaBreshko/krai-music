import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { servicesData } from '../cms/data'
import styles from './ServicesPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { Media } from '../shared/ui/Media'
import { RichText } from '../shared/ui/RichText'
import { richTextToPlain } from '../shared/lib/richTextPlain'
import { FiInfo, FiX } from 'react-icons/fi'

export default function ServicesPage() {
  const reduceMotion = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!openId) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [openId])

  const openService = servicesData.find((service) => service.id === openId) ?? null

  return (
    <>
      <Seo title="Услуги" description="Изучайте услуги по развитию артистов и работе с лейблом Kray Music." />
      <section className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <p className={styles.eyebrow}>Услуги</p>
        <h1>Поддержка на каждом этапе</h1>
        <p className={styles.subtitle}>Помогаем артистам расти: от записи трека до продвижения и выступлений.</p>
      </motion.div>
      <div className={styles.list}>
        {servicesData.map((service, index) => (
          <motion.article
            key={service.id}
            className={`${styles.card} ${index % 2 === 1 ? styles.reverse : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: reduceMotion ? 0 : (index % 2) * 0.08, ease: 'easeOut' }}
          >
            <Media src={service.image} alt={service.title} className={styles.image} />
            <div className={styles.content}>
              <h2>{service.title}</h2>
              <p className={styles.summary}>{service.shortDescription || richTextToPlain(service.description)}</p>
              {service.description && (
                <button
                  type="button"
                  className={styles.link}
                  onClick={() => setOpenId(service.id)}
                  aria-haspopup="dialog"
                >
                  Подробнее <FiInfo aria-hidden="true" />
                </button>
              )}
            </div>
          </motion.article>
        ))}
      </div>
    </section>

    <AnimatePresence>
      {openService && (
        <motion.div
          className={styles.modalOverlay}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpenId(null)}
        >
          <motion.div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={`Описание услуги — ${openService.title}`}
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>{openService.title}</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setOpenId(null)}
                aria-label="Закрыть"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
            <div className={styles.modalBody}>
              <RichText text={openService.description} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}
