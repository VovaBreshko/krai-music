import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

import styles from './Header.module.css'
import logo from '../../assets/logo.png'
import { useContent } from '../../hooks/useContent'
import { scrollToFooterBottom } from '../lib/footerScroll'

export function Header() {
  const [open, setOpen] = useState(false)
  const { links } = useContent()

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleContactsClick = () => {
    setOpen(false)
    scrollToFooterBottom()
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand} aria-label="Главная страница Kray Music">
          <img className={styles.logo} src={logo} alt="" />
        </NavLink>
        <button
          type="button"
          className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Открыть меню"
        >
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
          <span className={styles.burgerLine} />
        </button>
        <nav className={`${styles.nav} ${open ? styles.open : ''}`} aria-label="Основная навигация">
          {links.filter(link => link.to !== '/').map((link) => (
            link.to === '/contacts' ? (
              <button
                key={link.to}
                type="button"
                className={styles.linkButton}
                onClick={handleContactsClick}
              >
                {link.label}
              </button>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }: { isActive: boolean }) => `${styles.link} ${isActive ? styles.active : ''}`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            )
          ))}
        </nav>
      </div>
    </header>
  )
}
