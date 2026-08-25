import { FiMail, FiPhone, FiMapPin, FiLink } from 'react-icons/fi'
import styles from './Footer.module.css'
import { useContent } from '../../hooks/useContent'
import { SOCIAL_META } from '../lib/socials'
import logo from '../../assets/logo.png'
import { NavLink } from 'react-router-dom'

export function Footer() {
  const { contact, footer, links } = useContent()

  return (
    <footer id="footer" className={styles.footer}>
      <span className={styles.watermark} aria-hidden="true">КРАЙ MUSIC</span>
      <div className={styles.logoWrap}>
        <img src={logo} className={styles.logo} />
      </div>
      <div className={styles.container}>
        <div className={styles.section}>
          <div className={styles.sectionInner}>
            <h2 className={styles.head}>Разделы сайта</h2>
            <nav className={styles.nav} aria-label="Основная навигация">
              {links.filter(item => item.to !== '/contacts').map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={styles.link}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionInner}>
            <h2 className={styles.head}>Информация</h2>
            <nav className={styles.nav} aria-label="Основная навигация">
              <NavLink
                key='/privacy_policy'
                to='/privacy_policy'
                className={styles.link}
              >
                Политика конфиденциальности
              </NavLink>
              <NavLink
                key='/use_rules'
                to='/use_rules'
                className={styles.link}
              >
                Условия использования
              </NavLink>
            </nav>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionInner}>
            <h2 className={styles.head}>Контакты</h2>
            <div className={styles.details}>
              <a href={`mailto:${contact?.email}`} className={styles.item}>
                <FiMail />
                <span>{contact?.email}</span>
              </a>
              <a href={`tel:${contact?.phone}`} className={styles.item}>
                <FiPhone />
                <span>{contact?.phone}</span>
              </a>
              <div className={styles.item}>
                <FiMapPin />
                <span>{contact?.address}</span>
              </div>
              {contact.socials.map((social, index) => {
                const meta = social.type ? SOCIAL_META[social.type] : undefined
                const Icon = meta?.Icon
                const label = social.label?.trim() || meta?.defaultLabel || 'Ссылка'
                const key = `${label}-${social.url}-${index}`
                return (
                  <a
                    key={key}
                    href={social.url}
                    className={styles.item}
                    target="_blank"
                    rel="noreferrer"
                    title={label}
                  >
                    {Icon ? <Icon aria-hidden="true" className={styles.socialIcon} /> : <FiLink aria-hidden="true" />}
                    <span>{label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottom}>
        <p className={styles.copy}>
          {footer?.copyrightText ?? 'Все права защищены.'}
        </p>
        <p className={styles.designed}>
          Разработано&nbsp;<span>MAZE</span>
        </p>
      </div>
    </footer>
  )
}
