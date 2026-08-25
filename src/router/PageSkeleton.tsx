import { useEffect } from 'react'
import styles from './PageSkeleton.module.css'
import logo from '../assets/logo.png'
import { useLayoutContext } from '../app/layout/LayoutContext'

const EQ_HEIGHTS = [14, 18, 17, 26, 19, 24, 13]

export function PageSkeleton() {
  const { setFullBleed } = useLayoutContext()

  useEffect(() => {
    setFullBleed(true)
    return () => setFullBleed(false)
  }, [setFullBleed])

  return (
    <div className={styles.page} role="status">
      <div className={styles.vinyl} aria-hidden="true">
        <span className={styles.ring} />
        <span className={styles.disc}>
          <span className={styles.label}>
            <img src={logo} alt="" className={styles.logo} />
          </span>
        </span>
      </div>

      <p className={styles.wordmark}>
        <span className={styles.brandKray}>Край</span>
        <span className={styles.brandMusic}>Music</span>
      </p>
      <p className={styles.caption}>Загружаем страницу…</p>

      <div className={styles.equalizer} aria-hidden="true">
        {EQ_HEIGHTS.map((height, index) => (
          <span
            key={index}
            className={styles.eqBar}
            style={{ height, animationDelay: `${index * 0.11}s` }}
          />
        ))}
      </div>
    </div>
  )
}
