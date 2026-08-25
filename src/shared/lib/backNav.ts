import type { Location } from 'react-router-dom'

/**
 * Данные «умной» кнопки назад для страниц артиста/альбома.
 *
 * Цепочка переходов может быть многоуровневой: Главная → Артист → Альбом.
 * Поэтому храним не один адрес, а два:
 *  - `from`   — ближайшая предыдущая страница (куда ведёт кнопка «назад» с этой страницы);
 *  - `origin` — исходная страница, с которой началась цепочка. Он «пробрасывается»
 *    вглубь, чтобы при возврате по кнопке «назад» промежуточная страница знала, куда
 *    ей идти дальше, а не указывала сама на себя.
 *
 * Дополнительно переносим данные восстановления списка артистов (страница/поиск),
 * чтобы они дожили до финального возврата на страницу артистов.
 */
export interface BackLinkState {
  from: string
  origin: string
  fromArtistsPage?: boolean
  page?: number
  query?: string
}

/** Захватывает текущую страницу как начало цепочки (для корневых страниц). */
export function makeBackLinkState(location: Location): BackLinkState {
  const path = location.pathname + location.search
  return { from: path, origin: path }
}

/**
 * Состояние для перехода с детальной страницы (артист/альбом) на другую детальную:
 * ближайшим «предком» становится текущая страница, а origin цепочки сохраняется.
 */
export function makeDeeperState(
  location: Location,
  current: BackLinkState | null | undefined,
): BackLinkState {
  const path = location.pathname + location.search
  return {
    from: path,
    origin: current?.origin ?? path,
    fromArtistsPage: current?.fromArtistsPage,
    page: current?.page,
    query: current?.query,
  }
}

/**
 * Состояние для кнопки «назад» с детальной страницы. Возвращаемся на ближайшего
 * «предка», но передаём ему origin, чтобы его собственная кнопка «назад» указывала
 * дальше по цепочке, а не на самого себя.
 */
export function makeBackTargetState(
  current: BackLinkState | null | undefined,
): BackLinkState | undefined {
  if (!current) return undefined
  const base = current.origin ?? current.from
  return {
    from: base,
    origin: base,
    fromArtistsPage: current.fromArtistsPage,
    page: current.page,
    query: current.query,
  }
}

/** Человекочитаемая подпись кнопки «назад» по адресу источника. */
export function backLinkLabel(from: string): string {
  if (from === '/') return 'На главную'
  if (from === '/artists') return 'К артистам'
  if (from.startsWith('/artists/')) return 'К артисту'
  if (from.startsWith('/albums/')) return 'К альбому'
  if (from.startsWith('/radio')) return 'К радио'
  if (from.startsWith('/events')) return 'К мероприятиям'
  return 'Назад'
}

