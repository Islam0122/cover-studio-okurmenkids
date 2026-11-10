import { useEffect, useRef, useState } from 'react'
import type { CoverDocument } from '../types/template'
import { renderThumbnail } from '../utils/thumbnails'

export function useThumbnail(key: string, getDoc: () => CoverDocument, multiplier?: number) {
  const [state, setState] = useState<{ key: string; url: string | null }>({ key, url: null })
  const getDocRef = useRef(getDoc)
  getDocRef.current = getDoc

  useEffect(() => {
    let alive = true
    renderThumbnail(key, () => getDocRef.current(), multiplier)
      .then((url) => alive && setState({ key, url }))
      .catch(() => alive && setState({ key, url: null }))
    return () => {
      alive = false
    }
  }, [key, multiplier])

  return state.key === key ? state.url : null
}
