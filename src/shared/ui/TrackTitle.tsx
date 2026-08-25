import styles from './TrackTitle.module.css'

interface TrackTitleProps {
  title: string
}

/**
 * Название трека с подсветкой части в треугольных скобках.
 * «Мы с района <prod. by Black Water>» отобразится как
 * «Мы с района prod. by Black Water», где «prod. by Black Water»
 * закрашено серым, а скобки убраны.
 */
export function TrackTitle({ title }: TrackTitleProps) {
  const parts = title.split(/<([^>]+)>/g)

  return (
    <>
      {parts.map((part, index) =>
        // Чередование: чётные индексы — обычный текст, нечётные — содержимое скобок
        index % 2 === 1 ? (
          <span key={`tag-${index}`} className={styles.tag}>
            {part}
          </span>
        ) : part ? (
          <span key={`text-${index}`} className={styles.text}>
            {part}
          </span>
        ) : null
      )}
    </>
  )
}