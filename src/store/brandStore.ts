import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Fields } from '../types/template'

export type BrandSlot = 'logo' | 'seal' | 'signature'
export const BRAND_SLOTS: BrandSlot[] = ['logo', 'seal', 'signature']

interface BrandState {
  kit: Record<BrandSlot, string | null>
  setKit: (slot: BrandSlot, value: string | null) => void
}

/**
 * The organisation's own logo, stamp and signature, kept in this browser only
 * and filled into every new project.
 */
export const useBrandStore = create<BrandState>()(
  persist(
    (set, get) => ({
      kit: { logo: null, seal: null, signature: null },
      setKit: (slot, value) => set({ kit: { ...get().kit, [slot]: value } }),
    }),
    {
      name: 'cover-studio:brand-kit',
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
            /* quota: the kit simply isn't remembered */
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
    },
  ),
)

export function applyBrandKit(fields: Fields): Fields {
  const { kit } = useBrandStore.getState()
  const next = { ...fields }
  for (const slot of BRAND_SLOTS) if (kit[slot]) next[slot] = kit[slot]
  return next
}
