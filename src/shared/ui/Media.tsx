import { useState } from 'react'
import { getMediaUrl } from '../lib/media'
import styles from './Media.module.css'

interface MediaProps {
  src: string
  alt: string
  className?: string
  /** Дополнительный класс для обёртки (например, позиционирование в гриде) */
  wrapClassName?: string
  /** Отложенная загрузка — аналог loading="lazy" */
  lazy?: boolean
  /** Растянуть обёртку на родителя (width/height: 100%) для картинок-заполнителей */
  fill?: boolean
  onLoad?: () => void
}

/**
 * Изображение, которое показывается только после полной загрузки.
 * Пока картинка грузится, вместо неё отображается скелетон-прелоадер,
 * чтобы частичная загрузка «по кусочкам» не была видна.
 *
 * Состояние «загружено» привязано к конкретному URL: при смене src
 * изображение снова скрывается и показывается прелоадер — без эффектов.
 */
export function Media({ src, alt, className, wrapClassName, lazy, fill, onLoad }: MediaProps) {
  const url = getMediaUrl(src)
  const [loadedUrl, setLoadedUrl] = useState<string | null>(null)
  const loaded = loadedUrl === url

  if (!url) {
    return <img src="" alt={alt} className={className} />
  }

  const wrapClass = [styles.root, fill ? styles.fill : '', wrapClassName ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <span className={wrapClass}>
      <span
        className={`${styles.skeleton} ${loaded ? styles.skeletonHidden : ''}`.trim()}
        aria-hidden="true"
      />
      <img
        src={url}
        alt={alt}
        className={`${styles.img} ${className ?? ''} ${loaded ? styles.visible : styles.hidden}`}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => {
          setLoadedUrl(url)
          onLoad?.()
        }}
        onError={() => setLoadedUrl(url)}
      />
    </span>
  )
}


