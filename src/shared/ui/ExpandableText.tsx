import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'
import styles from './ExpandableText.module.css'

interface ExpandableTextProps {
  text: string
  /** Сколько строк показывать в свёрнутом состоянии (по умолчанию 5) */
  lines?: number
  /** Класс, применённый к <p> — позволяет сохранить стили исходного абзаца */
  className?: string
}

export function ExpandableText({ text, lines = 5, className }: ExpandableTextProps) {
  const [expanded, setExpanded] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)
  const [heights, setHeights] = useState<{ collapsed: number; full: number }>()
  const ref = useRef<HTMLParagraphElement>(null)
  const expandedRef = useRef(expanded)
  const reduceMotion = useReducedMotion()

  // Держим актуальное значение expanded вне рендера — оно нужно в measure(),
  // вызываемом из useLayoutEffect и колбэков. Обновление ref во время рендера
  // запрещено правилами React, поэтому переносим в эффект.
  useEffect(() => {
    expandedRef.current = expanded
  }, [expanded])

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const wasExpanded = expandedRef.current
    const prevHeight = el.style.height

    // На время замера сбрасываем явную высоту, иначе она мешает измерить
    // высоту N строк (в раскрытом состоянии inline-height = полной высоте)
    el.style.height = 'auto'
    // Высота N строк (временно включаем clamp)
    el.style.webkitLineClamp = String(lines)
    const collapsed = el.clientHeight
    // Полная высота текста (временно снимаем clamp)
    el.style.webkitLineClamp = 'none'
    const full = el.scrollHeight
    // Возвращаем clamp и высоту согласно текущему состоянию
    el.style.webkitLineClamp = wasExpanded ? 'none' : String(lines)
    el.style.height = prevHeight

    setHeights((prev) => {
      const next = { collapsed, full }
      return prev && prev.collapsed === next.collapsed && prev.full === next.full ? prev : next
    })
    setHasOverflow(full > collapsed + 1)
  }, [lines])

  useLayoutEffect(() => {
    // Измеряем высоты один раз при монтировании (элемент свёрнут, без активной
    // анимации). Не перезамеряем во время анимации — повторный замер через
    // ResizeObserver обрывал CSS-переход и кнопку.
    measure()
  }, [measure])

  const height = heights && heights.full > 0 ? (expanded ? heights.full : heights.collapsed) : undefined

  const clampStyle: CSSProperties = {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: expanded ? 'none' : lines,
    overflow: 'hidden',
    height: height ?? undefined,
    transition: reduceMotion ? 'none' : 'height 0.3s ease',
  }

  return (
    <>
      <p ref={ref} className={className} style={clampStyle}>
        {text}
      </p>
      {hasOverflow && (
        <button
          type="button"
          className={styles.button}
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          {expanded ? 'Свернуть' : 'Развернуть'}
          <FiChevronDown
            className={`${styles.chevron}${expanded ? ` ${styles.chevronUp}` : ''}`}
            aria-hidden="true"
          />
        </button>
      )}
    </>
  )
}

