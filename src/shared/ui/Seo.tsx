import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SeoProps {
  title: string
  description: string
}

// Продакшн-домен без завершающего слэша. Переопределяется через VITE_SITE_URL,
// если сайт разворачивается не на GitHub Pages.
const SITE_ORIGIN = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, '') ?? 'https://sjmaks.github.io'

export function Seo({ title, description }: SeoProps) {
  const location = useLocation()

  useEffect(() => {
    document.title = `${title} | КрайMusic`
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', `${SITE_ORIGIN}${location.pathname}`)
  }, [description, location.pathname, title])

  return null
}
