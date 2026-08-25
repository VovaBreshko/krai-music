/**
 * Короткий plain-text вариант rich text (без разметки) — фолбэк для карточки,
 * когда у услуги не заполнено отдельное короткое описание.
 */
export function richTextToPlain(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[#>|*+\-= ]+$/gm, '')
    .replace(/[*_`~#>]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}