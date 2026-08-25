import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { eventsData } from '../cms/data'
import styles from './EventsPage.module.css'
import { Seo } from '../shared/ui/Seo'
import { FiMapPin, FiCalendar } from 'react-icons/fi'
import { Media } from '../shared/ui/Media'
import { ExpandableText } from '../shared/ui/ExpandableText'

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

function formatBadge(dateString?: string): { day: string; month: string } {
  if (!dateString) return { day: '--', month: '' }
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return { day: '--', month: '' }
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: SHORT_MONTHS[date.getMonth()],
  }
}

export default function EventsPage() {
  const reduceMotion = useReducedMotion()
  const location = useLocation()

  // Автопрокрутка к конкретному мероприятию при переходе с главной страницы
  // (кнопка «Подробнее» ведёт на /events#<id>).
  useEffect(() => {
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id)
      if (!el) return
      // Учитываем scroll-margin-top карточки (отступ под липкую шапку) и
      // дополнительно приподнимаем страницу на 20px для отступа сверху.
      const scrollMargin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - scrollMargin - 20)
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [location.hash, reduceMotion])

  return (
    <>
      <Seo title="Мероприятия" description="Актуальные события и показы лейбла Kray Music." />
      <section className={styles.page}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        >
          <p className={styles.eyebrow}>Мероприятия</p>
          <h1>Уникальные события</h1>
          <p className={styles.subtitle}>Приходите на концерты, вечеринки и батлы артистов лейбла — здесь рождается живой звук.</p>
        </motion.div>
        <div className={styles.list}>
          {eventsData.map((event, index) => (
            <motion.article
              key={event.id}
              id={event.id}
              className={`${styles.card} ${index % 2 === 1 ? styles.reverse : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: reduceMotion ? 0 : (index % 2) * 0.08, ease: 'easeOut' }}
            >
              <div className={styles.media}>
                <Media src={event.image} alt={event.title} className={styles.image} />
                <span className={styles.dateBadge}>
                  <span className={styles.dateBadgeDay}>{formatBadge(event.date).day}</span>
                  <span className={styles.dateBadgeMonth}>{formatBadge(event.date).month}</span>
                </span>
              </div>
              <div className={styles.content}>
                <h2>{event.title}</h2>
                <ExpandableText text={event.description} className={styles.cardText} lines={4} />
                <div className={styles.item}>
                  <FiCalendar />
                  <p>{formatDate(event.date)}</p>
                </div>
                <div className={styles.item}>
                  <FiMapPin />
                  <p>{event.location}</p>
                </div>
                {event.links && event.links.length > 0 && (
                  <div className={styles.links}>
                    {event.links.map((link) => (
                      <a key={link.label} href={link.url} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  )
}
