import type { CoverDocument } from '../types/template'
import { QUALITY_PRESETS, safeFileName, type ExportQuality } from './exportImage'
import { renderToDataUrl } from './renderer'

const A4_MM = { short: 210, long: 297 }

export async function exportPdf(doc: CoverDocument, name: string, quality: ExportQuality) {
  const { jsPDF } = await import('jspdf')
  const portrait = doc.orientation === 'portrait'
  const w = portrait ? A4_MM.short : A4_MM.long
  const h = portrait ? A4_MM.long : A4_MM.short
  // PNG keeps text edges crisp; the PDF is compressed by jsPDF's deflate.
  const dataUrl = await renderToDataUrl(doc, { multiplier: QUALITY_PRESETS[quality].multiplier, format: 'png' })
  const pdf = new jsPDF({ orientation: doc.orientation, unit: 'mm', format: 'a4', compress: true })
  pdf.setProperties({ title: name, creator: 'Cover Studio' })
  pdf.addImage(dataUrl, 'PNG', 0, 0, w, h, undefined, 'FAST')
  pdf.save(`${safeFileName(name)}.pdf`)
}
