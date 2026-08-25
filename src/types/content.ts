export type SocialNetwork =
  | 'vk'
  | 'telegram'
  | 'instagram'
  | 'x'
  | 'facebook'
  | 'custom'

export interface SocialLink {
  label: string
  url: string
  type?: SocialNetwork
}

export interface Video {
  title: string
  description: string
  url: string
  cover: string
}

export interface Artist {
  id: string
  nickname: string
  biography: string
  verticalImage: string
  squareImage: string
  socials: SocialLink[]
  videos: Video[]
  featuredTrack?: Track | null
  featuredAlbum?: Album | null
}

export interface Track {
  id: string
  title: string
  authors: Artist[]
  cover: string
  audio: string
  releaseDate: string
  description: string
}

export interface Album {
  id: string
  title: string
  authors: Artist[]
  cover: string
  releaseDate: string
  description: string
  tracks: Track[]
}

export interface Event {
  id: string
  title: string
  description: string
  image: string
  date: string
  location: string
  links: SocialLink[]
}

export interface Service {
  id: string
  title: string
  /** Короткое описание для карточки на странице «Услуги». */
  shortDescription?: string
  /** Подробное описание в разметке richtext-редактора CMS (CommonMark). */
  description: string
  image: string
}

export interface HomepageContent {
  heroTitle: string
  heroSubtitle: string
  featuredArtists: Artist[]
  featuredAlbums: Album[]
  featuredTracks: Track[]
  featuredEvents: Event[]
}

export interface ContactContent {
  email: string
  phone: string
  address: string
  socials: SocialLink[]
}

export interface RadioContent {
  albums: Album[]
}

export interface RadioPlaylist {
  orderedTracks: string[]
  artistFilters: string[]
}

/** Файл правового документа из CMS (поле richtext). */
export interface LegalContent {
  body: string
}
