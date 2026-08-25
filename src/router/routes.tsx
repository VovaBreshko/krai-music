import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Suspense } from 'react'
import { Layout } from '../app/layout/Layout'
import {
  ArtistDetailPage,
  AlbumDetailPage,
  ArtistsPage,
  EventsPage,
  HomePage,
  NotFoundPage,
  PrivacyPolicyPage,
  RadioPage,
  ServicesPage,
  UseRulesPage,
} from './pageComponents'
import { PageSkeleton } from './PageSkeleton'
import ErrorPage from '../pages/ErrorPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Suspense fallback={<PageSkeleton />}><HomePage /></Suspense> },
      { path: 'artists', element: <Suspense fallback={<PageSkeleton />}><ArtistsPage /></Suspense> },
      { path: 'artists/:id', element: <Suspense fallback={<PageSkeleton />}><ArtistDetailPage /></Suspense> },
      { path: 'albums/:id', element: <Suspense fallback={<PageSkeleton />}><AlbumDetailPage /></Suspense> },
      { path: 'events', element: <Suspense fallback={<PageSkeleton />}><EventsPage /></Suspense> },
      { path: 'services', element: <Suspense fallback={<PageSkeleton />}><ServicesPage /></Suspense> },
      { path: 'radio', element: <Suspense fallback={<PageSkeleton />}><RadioPage /></Suspense> },
      { path: 'privacy_policy', element: <Suspense fallback={<PageSkeleton />}><PrivacyPolicyPage /></Suspense> },
      { path: 'use_rules', element: <Suspense fallback={<PageSkeleton />}><UseRulesPage /></Suspense> },
      { path: '404', element: <Suspense fallback={<PageSkeleton />}><NotFoundPage /></Suspense> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
],
{
  basename: '/krai-music',
})
