import type { CoverDocument } from '../types/template'
import { pageSize } from './document'
import { renderToDataUrl } from './renderer'

export type ExportQuality = 'standard' | 'high' | 'ultra'

/** Multipliers over the 96-DPI layout grid. */
export const QUALITY_PRESETS: Record<ExportQuality, { label: string; multiplier: number; dpi: number }> = {
  standard: { label: 'Стандарт', multiplier: 2, dpi: 192 },
  high: { label: 'Печать', multiplier: 3.125, dpi: 300 },
  ultra: { label: 'Максимум', multiplier: 4, dpi: 384 },
}

export function exportDimensions(doc: CoverDocument, quality: ExportQuality) {
  const { width, height } = pageSize(doc.orientation)
  const m = QUALITY_PRESETS[quality].multiplier
  return { width: Math.round(width * m), height: Math.round(height * m) }
}

export function safeFileName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-')
  return cleaned.slice(0, 80) || 'cover'
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export async function exportPng(doc: CoverDocument, name: string, quality: ExportQuality) {
  const dataUrl = await renderToDataUrl(doc, { multiplier: QUALITY_PRESETS[quality].multiplier, format: 'png' })
  downloadDataUrl(dataUrl, `${safeFileName(name)}.png`)
}
