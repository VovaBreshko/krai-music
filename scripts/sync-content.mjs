#!/usr/bin/env node
/**
 * sync-content.mjs
 *
 * Repair tool that restores referential integrity across the Decap CMS content
 * tree after records are deleted.
 *
 * Decap (Netlify) CMS has no native "cascade delete": deleting an artist leaves
 * its id behind in every related record — featured lists on the homepage, radio
 * albums, track/album authors, album track lists, etc. The dangling ids then
 * crash the static site build (see src/cms/data.ts, which used to throw).
 *
 * This script scans every JSON file under `content/`, builds the set of ids
 * that actually exist for each record type, and strips any reference to a
 * missing record. It is idempotent and only rewrites files that actually
 * changed. Run it before building:
 *
 *   node scripts/sync-content.mjs        # or `npm run sync:content`
 *
 * It is also wired into the default build pipeline (package.json -> "build"),
 * so the deployed site is always built from consistent content.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content')

const read = (path) => JSON.parse(readFileSync(path, 'utf8'))
const jsonFilesIn = (folder) => {
  const dir = join(CONTENT, folder)
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f))
}
const loadFolder = (folder) => jsonFilesIn(folder).map((path) => ({ path, data: read(path) }))

const collectIds = (folder) => {
  const ids = new Set()
  for (const { data } of loadFolder(folder)) {
    if (typeof data.id === 'string') ids.add(data.id)
  }
  return ids
}

const artistIds = collectIds('artists')
const trackIds = collectIds('tracks')
const albumIds = collectIds('albums')
const eventIds = collectIds('events')

/** Keep only ids that still exist for the given type. */
const keep = (valid, ids) => (Array.isArray(ids) ? ids.filter((id) => valid.has(id)) : ids)

let changedCount = 0

function writeIfChanged(path, before, after, context) {
  const serialized = JSON.stringify(before, null, 2)
  const repaired = JSON.stringify(after, null, 2)
  if (serialized === repaired) return
  writeFileSync(path, repaired + '\n', 'utf8')
  changedCount += 1
  const removed = beforePropslost(before, after)
  const label = removed.map((r) => `${r.field} → ${r.where}`).join('; ') || 'dangling references'
  console.log(`  sync  ${context}: removed ${label}`)
}

/** Collect fields whose value shrank, so we can name them in the report. */
function beforePropslost(before, after) {
  const lost = []
  for (const key of Object.keys(before)) {
    if (Array.isArray(before[key]) && Array.isArray(after[key]) && before[key].length > after[key].length) {
      const removed = before[key].filter((v) => !after[key].includes(v))
      lost.push({ field: key, where: removed.join(', ') })
    } else if (!Array.isArray(before[key]) && !Array.isArray(after[key]) && before[key] !== after[key]) {
      // single relation field was cleared (e.g. featuredTrack/featuredAlbum)
      lost.push({ field: key, where: typeof after[key] === 'undefined' ? '(cleared)' : String(before[key]) })
    }
  }
  return lost
}

// ─── content/homepage.json ──────────────────────────────────────────────
{
  const file = join(CONTENT, 'homepage.json')
  if (existsSync(file)) {
    const data = read(file)
    const after = {
      ...data,
      featuredArtists: keep(artistIds, data.featuredArtists),
      featuredAlbums: keep(albumIds, data.featuredAlbums),
      featuredTracks: keep(trackIds, data.featuredTracks),
      featuredEvents: keep(eventIds, data.featuredEvents),
    }
    writeIfChanged(file, data, after, 'homepage.json')
  }
}

// ── content/radio.json ─────────────────────────────────────────────────
{
  const file = join(CONTENT, 'radio.json')
  if (existsSync(file)) {
    const data = read(file)
    const after = { ...data, albums: keep(albumIds, data.albums) }
    writeIfChanged(file, data, after, 'radio.json')
  }
}

// ── content/tracks/*.json (authors) ─────────────────────────────────────
for (const { path, data } of loadFolder('tracks')) {
  const after = { ...data, authors: keep(artistIds, data.authors) }
  writeIfChanged(path, data, after, `track ${data.title ?? data.id ?? path}`)
}

// ── content/albums/*.json (authors, tracks) ─────────────────────────────
for (const { path, data } of loadFolder('albums')) {
  const after = { ...data, authors: keep(artistIds, data.authors), tracks: keep(trackIds, data.tracks) }
  writeIfChanged(path, data, after, `album ${data.title ?? data.id}`)
}

// ── content/artists/*.json (featured track / album) ─────────────────────
for (const { path, data } of loadFolder('artists')) {
  const after = { ...data }
  if (typeof after.featuredTrack === 'string' && !trackIds.has(after.featuredTrack)) {
    delete after.featuredTrack
  }
  if (typeof after.featuredAlbum === 'string' && !albumIds.has(after.featuredAlbum)) {
    delete after.featuredAlbum
  }
  writeIfChanged(path, data, after, `artist ${data.nickname ?? data.id}`)
}

if (changedCount === 0) {
  console.log('sync-content: no dangling references found — content is consistent.')
} else {
  console.log(`sync-content: repaired ${changedCount} file(s).`)
}