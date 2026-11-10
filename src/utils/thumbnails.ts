import type { CoverDocument } from '../types/template'
import { renderToDataUrl } from './renderer'

const cache = new Map<string, Promise<string>>()
let queue: Promise<unknown> = Promise.resolve()

/** Renders small previews one at a time so a full gallery never blocks the main thread. */
export function renderThumbnail(key: string, getDoc: () => CoverDocument, multiplier = 0.42): Promise<string> {
  const hit = cache.get(key)
  if (hit) return hit
  const job = queue.then(() => renderToDataUrl(getDoc(), { multiplier, format: 'jpeg', quality: 0.86 }))
  queue = job.catch(() => undefined)
  cache.set(key, job)
  job.catch(() => cache.delete(key))
  if (cache.size > 120) {
    const first = cache.keys().next().value
    if (first) cache.delete(first)
  }
  return job
}
