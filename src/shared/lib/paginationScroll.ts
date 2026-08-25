// Помощники авто-прокрутки пагинируемых списков.
//
// Требование: при смене страницы скроллим к первому элементу списка ТОЛЬКО если
// этот первый элемент сейчас не виден в окне (пользователь уже проматывал вниз).
// Если первый элемент виден — прокрутка не нужна, пользователь и так у начала списка.

/** Виден ли первый элемент списка в пределах окна просмотра (по вертикали). */
export function isFirstItemVisible(list: HTMLElement | null): boolean {
  if (!list) return true
  const first = list.firstElementChild
  if (!first) return true
  const rect = first.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  // Элемент «виден», если его прямоугольник пересекается с окном просмотра.
  return rect.top <= viewportHeight && rect.bottom >= 0
}

/** Количество лишних пикселей, на которое проматывается список выше обычной точки. */
const EXTRA_SCROLL_PX = 30

/**
 * Плавно прокручивает список так, чтобы его первый элемент оказался у верхнего
 * края окна, учитывая отступ под липкую шапку (scroll-margin-top), и дополнительно
 * проматывает на EXTRA_SCROLL_PX пикселей больше.
 */
export function scrollListToStart(list: HTMLElement | null, behavior: ScrollBehavior = 'smooth'): void {
  if (!list) return
  const first = list.firstElementChild
  if (!(first instanceof HTMLElement)) {
    list.scrollIntoView({ behavior, block: 'start' })
    return
  }
  // Отступ под липкую шапку берём из scroll-margin-top самого списка.
  const headerOffset = parseFloat(getComputedStyle(list).scrollMarginTop) || 0
  const top = first.getBoundingClientRect().top + window.scrollY - headerOffset - EXTRA_SCROLL_PX
  window.scrollTo({ top, behavior })
}

