import { useEffect, useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import { useProjectStore } from '../store/projectStore'

/** Writes the open document back to its project, debounced, and on leave. */
export function useAutosave(delay = 500) {
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const flush = () => {
      clearTimeout(timer)
      timer = undefined
      const { projectId, doc, name } = useEditorStore.getState()
      if (projectId && doc) useProjectStore.getState().saveProject(projectId, { document: doc, name: name.trim() || 'Без названия' })
      setSaving(false)
    }
    const unsub = useEditorStore.subscribe((s, prev) => {
      if (!s.projectId || s.projectId !== prev.projectId) return
      if (s.doc === prev.doc && s.name === prev.name) return
      setSaving(true)
      clearTimeout(timer)
      timer = setTimeout(flush, delay)
    })
    window.addEventListener('beforeunload', flush)
    return () => {
      if (timer) flush()
      unsub()
      window.removeEventListener('beforeunload', flush)
    }
  }, [delay])

  return saving
}
