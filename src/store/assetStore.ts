import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useProjectStore } from './projectStore'
import { useBrandStore } from './brandStore'
import { useEditorStore } from './editorStore'

/**
 * Uploaded images live here once, keyed by content hash. Projects, the brand kit
 * and undo history store a short "asset:<id>" reference instead of the image,
 * so the same stamp used in ten certificates costs its size only once.
 */
export const ASSET_PREFIX = 'asset:'
const REF = /asset:[a-z0-9]+/g

interface AssetState {
  assets: Record<string, string>
}

export const useAssetStore = create<AssetState>()(
  persist(() => ({ assets: {} as Record<string, string> }), {
    name: 'cover-studio:assets',
    version: 1,
    storage: createJSONStorage(() => ({
      getItem: (n) => {
        try {
          return localStorage.getItem(n)
        } catch {
          return null
        }
      },
      setItem: (n, v) => {
        try {
          localStorage.setItem(n, v)
        } catch {
          useProjectStore.setState({
            storageError: 'Хранилище браузера заполнено — изображение не сохранилось. Удалите старые проекты или загрузите файл поменьше.',
          })
        }
      },
      removeItem: (n) => {
        try {
          localStorage.removeItem(n)
        } catch {
          /* ignore */
        }
      },
    })),
  }),
)

function hash(s: string): string {
  // FNV-1a over the string, plus its length, is plenty to tell uploads apart
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(36) + s.length.toString(36)
}

/** Stores a data URL and returns its reference; other values pass through. */
export function putAsset(src: string): string {
  if (!src.startsWith('data:') || src.length < 4096) return src
  const id = hash(src)
  const { assets } = useAssetStore.getState()
  if (!assets[id]) useAssetStore.setState({ assets: { ...assets, [id]: src } })
  return ASSET_PREFIX + id
}

export function resolveAsset(src: string): string
export function resolveAsset(src: string | null | undefined): string | null
export function resolveAsset(src: string | null | undefined): string | null {
  if (!src) return null
  if (!src.startsWith(ASSET_PREFIX)) return src
  return useAssetStore.getState().assets[src.slice(ASSET_PREFIX.length)] ?? null
}

/** Removes assets nothing refers to any more. */
function collectGarbage() {
  const used = new Set<string>()
  const scan = (value: unknown) => {
    for (const m of JSON.stringify(value).matchAll(REF)) used.add(m[0].slice(ASSET_PREFIX.length))
  }
  scan(useProjectStore.getState().projects)
  scan(useBrandStore.getState().kit)
  const editor = useEditorStore.getState()
  scan([editor.doc, editor.past, editor.future])
  const { assets } = useAssetStore.getState()
  const kept = Object.fromEntries(Object.entries(assets).filter(([id]) => used.has(id)))
  if (Object.keys(kept).length !== Object.keys(assets).length) useAssetStore.setState({ assets: kept })
}

let timer: ReturnType<typeof setTimeout> | undefined
const scheduleGc = () => {
  clearTimeout(timer)
  timer = setTimeout(collectGarbage, 1500)
}
useProjectStore.subscribe((s, p) => s.projects.length !== p.projects.length && scheduleGc())
useBrandStore.subscribe(scheduleGc)
useEditorStore.subscribe((s, p) => s.projectId !== p.projectId && scheduleGc())
