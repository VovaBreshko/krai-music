import { useMemo } from 'react'
import { artistsData, homepageContentData, contactData, tracksData } from '../cms/data'
import type { Artist, ContactContent, HomepageContent, RadioPlaylist, Track } from '../types/content'

export function useContent() {
  const artists = artistsData as Artist[]
  const tracks = useMemo(() => tracksData as Track[], [])
  const homepage = useMemo<HomepageContent>(() => homepageContentData, [])
  const contact = useMemo<ContactContent>(() => contactData, [])
  const footer = useMemo(() => ({ labelName: 'Край Music', copyrightText: '© 2026 КРАЙ MUSIC. ALL RIGHTS RESERVED.' }), [])
  const links = useMemo(() => ([
    { to: '/', label: 'Главная' },
    { to: '/artists', label: 'Артисты' },
    { to: '/events', label: 'Мероприятия' },
    { to: '/services', label: 'Услуги' },
    { to: '/radio', label: 'Радио' },
    { to: '/contacts', label: 'Контакты' },
  ]), [])
  const radio = useMemo<RadioPlaylist>(() => ({ orderedTracks: [], artistFilters: [] }), [])

  return { artists, tracks, homepage, contact, footer, radio, links }
}
