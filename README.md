# Kray Music

A production-ready static website for Kray Music built with React, TypeScript, React Router, Zustand, CSS Modules, and Decap CMS.

## Features

- Responsive pages for home, artists, artist details, events, services, radio, and contact routes
- Global floating audio player with queue, playback, shuffle, repeat, volume, and seek controls
- Content-driven CMS collections for artists, tracks, events, services, homepage, contacts, and radio
- SEO metadata, lazy loading, scroll restoration, responsive layouts, and accessible navigation

## Local development

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the site at `http://localhost:5173/`

## Decap CMS

The CMS is available at `/admin/`.

### Cascading removal of related content

Decap CMS commits records as plain JSON files and has no built-in "cascade
delete": when you delete a record, its `id` stays behind in every file that
referenced it (`featuredArtists`/`featuredAlbums`/`featuredTracks`/`featuredEvents`
on the homepage, `albums` on the radio page, `authors` on tracks and albums,
`tracks` on albums, and `featuredTrack`/`featuredAlbum` on artists).

To keep the site healthy this repository handles it in two layers:

1. **Automatic repair — `npm run sync:content`** (`scripts/sync-content.mjs`)
   scans the whole `content/` tree, and any reference to a deleted record is
   removed from its JSON files. This also runs automatically at the start of
   every `npm run build`, so the deployed site is always generated from
   consistent content even if the repo still contains dangling ids.
2. **Defensive data loader** (`src/cms/data.ts`) never throws on a missing
   reference — dangling ids are simply skipped, so a single leftover reference
   can never crash the site build again.

Run the repair manually anytime after deleting records:

```bash
npm run sync:content
```

### GitHub OAuth

1. Create a GitHub OAuth App in your GitHub account.
2. Set the callback URL to `https://your-domain.com/auth/github/callback`.
3. Update `admin/config.yml` with your repository and branch.
4. Deploy the site with a serverless auth endpoint or use the Netlify option below.

### Netlify Identity + Git Gateway

1. Create a site on Netlify and enable Identity.
2. Enable Git Gateway.
3. Configure the backend section in `admin/config.yml` to use Git Gateway.
4. Deploy and visit `/admin/` to sign in.

## Media uploads

Images and audio are stored under the public folder and can be uploaded from the CMS through the configured media folder.

## Deployment

### GitHub Pages

- Build with `npm run build`
- Deploy the contents of `dist/` to GitHub Pages

### Netlify

- Connect the repository and set the build command to `npm run build`
- Publish directory: `dist`

### Vercel

- Import the repository and use the standard Vite build settings
- Build command: `npm run build`
- Output directory: `dist`
