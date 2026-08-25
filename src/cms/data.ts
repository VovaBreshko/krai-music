import type { Album, Artist, Event, HomepageContent, RadioContent, Service, Track, ContactContent, SocialLink, LegalContent } from '../types/content'
import homepageJson from '../../content/homepage.json'
import contactsJson from '../../content/contacts.json'
import radioJson from '../../content/radio.json'
import privacyPolicyJson from '../../content/legal/privacy_policy.json'
import useRulesJson from '../../content/legal/use_rules.json'

const artistModules = import.meta.glob('../../content/artists/*.json', { eager: true, import: 'default' })
const trackModules = import.meta.glob('../../content/tracks/*.json', { eager: true, import: 'default' })
const albumModules = import.meta.glob('../../content/albums/*.json', { eager: true, import: 'default' })
const eventModules = import.meta.glob('../../content/events/*.json', { eager: true, import: 'default' })
const serviceModules = import.meta.glob('../../content/services/*.json', { eager: true, import: 'default' })

/**
 * Raw shape of content/homepage.json as authored in the CMS:
 * featured* fields hold string ids that are resolved to entities below.
 */
interface HomepageJson {
  heroTitle?: string
  heroSubtitle?: string
  featuredArtists?: string[]
  featuredAlbums?: string[]
  featuredTracks?: string[]
  featuredEvents?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawArtists = Object.values(artistModules) as any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawTracks = Object.values(trackModules) as any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawAlbums = Object.values(albumModules) as any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawEvents = Object.values(eventModules) as any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawServices = Object.values(serviceModules) as any[]

const artistsMap = new Map<string, Artist>()
const tracksMap = new Map<string, Track>()

/**
 * Resolve a list of reference ids against a lookup map, silently dropping any
 * id that no longer resolves to an existing record.
 *
 * This makes the CMS safe to use with cascade "deletes": if a record (e.g. an
 * artist) is removed while related records (tracks / albums / homepage) still
 * reference it by id, the dangling reference is simply ignored instead of
 * throwing and taking the whole site build down with it.
 */
function resolveOrDrop<T>(ids: string[] | undefined, map: Map<string, T>): T[] {
  if (!Array.isArray(ids)) return []
  const resolved: T[] = []
  for (const id of ids) {
    const entity = map.get(id)
    if (entity) resolved.push(entity)
  }
  return resolved
}

function resolveOrDropFromList<T extends { id: string }>(ids: string[] | undefined, items: T[]): T[] {
  const byId = new Map<string, T>(items.map(item => [item.id, item] as [string, T]))
  return resolveOrDrop(ids, byId)
}

rawArtists.forEach(artist => {
  artistsMap.set(artist.id, {
    ...artist,
    featuredTrack: null,
    featuredAlbum: null,
  })
})

rawTracks.forEach(track => {
  const authors = resolveOrDrop(track.authors, artistsMap)
  const fullTrack: Track = { ...track, authors }
  tracksMap.set(track.id, fullTrack)
})

const albumsMap = new Map<string, Album>()
rawAlbums.forEach(album => {
  const authors = resolveOrDrop(album.authors, artistsMap)
  const tracks = resolveOrDrop(album.tracks, tracksMap)
  const fullAlbum: Album = { ...album, authors, tracks }
  albumsMap.set(album.id, fullAlbum)
})

const artistsWithFeatured: Artist[] = rawArtists.map(artist => {
  const base = artistsMap.get(artist.id)!
  const featuredTrackId = artist.featuredTrack as string | undefined | null
  const featuredTrack = featuredTrackId ? tracksMap.get(featuredTrackId) || null : null
  const featuredAlbumId = artist.featuredAlbum as string | undefined | null
  const featuredAlbum = featuredAlbumId ? albumsMap.get(featuredAlbumId) || null : null
  return {
    ...base,
    featuredTrack,
    featuredAlbum,
  }
}) as Artist[]

const artistsMapFinal = new Map<string, Artist>()
artistsWithFeatured.forEach(a => artistsMapFinal.set(a.id, a))

const events: Event[] = rawEvents as Event[]
const services: Service[] = rawServices as Service[]

const homepageData = homepageJson as HomepageJson

const homepageContent: HomepageContent = {
  heroTitle: homepageData.heroTitle ?? '— Добро пожаловать! —',
  heroSubtitle: homepageData.heroSubtitle ?? ' — музыкальный лейбл, который открывает новые имена и задаёт тренды.',
  featuredArtists: resolveOrDrop(homepageData.featuredArtists, artistsMapFinal),
  featuredAlbums: resolveOrDrop(homepageData.featuredAlbums, albumsMap),
  featuredTracks: resolveOrDrop(homepageData.featuredTracks, tracksMap),
  featuredEvents: resolveOrDropFromList(homepageData.featuredEvents, events),
}

const contacts: ContactContent = {
  email: contactsJson.email ?? 'vovabreshko@mail.ru',
  phone: contactsJson.phone ?? '+79620751111',
  address: contactsJson.address ?? 'Красноярск, ул. Курчатова, 11А',
  socials: (contactsJson.socials ?? []) as SocialLink[],
}

const radioAlbumIds = (Array.isArray(radioJson.albums) ? radioJson.albums : []) as unknown as string[]

const radioContent: RadioContent = {
  albums: resolveOrDrop(radioAlbumIds, albumsMap),
}

export const artistsData = artistsWithFeatured
export const tracksData = Array.from(tracksMap.values())
export const albumsData = Array.from(albumsMap.values())
export const eventsData = events
export const servicesData = services
export const homepageContentData = homepageContent
export const contactData = contacts
export const radioContentData = radioContent
export const privacyPolicyContent = (privacyPolicyJson as LegalContent).body ?? ''
export const useRulesContent = (useRulesJson as LegalContent).body ?? ''