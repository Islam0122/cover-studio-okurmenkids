import { useEffect } from 'react'
import { useEditorStore } from '../store/editorStore'

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

export function useEditorShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useEditorStore.getState()
      const mod = e.ctrlKey || e.metaKey
      const key = e.key.toLowerCase()

      if (mod && key === 'z' && !isTyping(e.target)) {
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
        return
      }
      if (mod && key === 'y' && !isTyping(e.target)) {
        e.preventDefault()
        s.redo()
        return
      }
      if (isTyping(e.target)) return
      if (mod && (key === '=' || key === '+')) {
        e.preventDefault()
        s.zoomBy(1.2)
        return
      }
      if (mod && key === '-') {
        e.preventDefault()
        s.zoomBy(1 / 1.2)
        return
      }
      if (mod && key === '0') {
        e.preventDefault()
        s.fitToScreen()
        return
      }
      if (key === 'escape') {
        if (s.preview) s.togglePreview(false)
        else s.select(null)
        return
      }
      const id = s.selectedId
      if (!id) return
      if (key === 'delete' || key === 'backspace') {
        e.preventDefault()
        s.removeElement(id)
      } else if (mod && key === 'd') {
        e.preventDefault()
        s.duplicateElement(id)
      } else if (key.startsWith('arrow')) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0
        const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0
        s.nudge(id, dx, dy)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
