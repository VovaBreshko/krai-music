import { lazy } from 'react'

export const HomePage = lazy(async () => import('../pages/HomePage'))
export const ArtistsPage = lazy(async () => import('../pages/ArtistsPage'))
export const ArtistDetailPage = lazy(async () => import('../pages/ArtistDetailPage'))
export const AlbumDetailPage = lazy(async () => import('../pages/AlbumDetailPage'))
export const EventsPage = lazy(async () => import('../pages/EventsPage'))
export const ServicesPage = lazy(async () => import('../pages/ServicesPage'))
export const RadioPage = lazy(async () => import('../pages/RadioPage'))
export const PrivacyPolicyPage = lazy(async () => import('../pages/PrivacyPolicyPage'))
export const UseRulesPage = lazy(async () => import('../pages/UseRulesPage'))
export const NotFoundPage = lazy(async () => import('../pages/NotFoundPage'))
