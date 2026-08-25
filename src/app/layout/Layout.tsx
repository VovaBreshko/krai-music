import { useMemo, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Header } from '../../shared/ui/Header'
import { Footer } from '../../shared/ui/Footer'
import { Player } from '../../shared/ui/Player'
import { BackToTop } from '../../shared/ui/BackToTop'
import LayoutContext from './LayoutContext'
import styles from '../../shared/ui/Layout.module.css'

export function Layout() {
  const [fullBleed, setFullBleed] = useState(false)
  const contextValue = useMemo(() => ({ fullBleed, setFullBleed }), [fullBleed])

  return (
    <LayoutContext.Provider value={contextValue}>
      <div className={styles.layout}>
        <Header />
        <main className={`${styles.main}${fullBleed ? ` ${styles.mainFullBleed}` : ''}`}>
          <div className={`${styles.container}${fullBleed ? ` ${styles.containerFullBleed}` : ''}`}>
            <Outlet />
          </div>
        </main>
        <Footer />
        <Player />
        <BackToTop />
        <ScrollRestoration />
      </div>
    </LayoutContext.Provider>
  )
}
