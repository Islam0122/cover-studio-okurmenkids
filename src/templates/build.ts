import type { CoverDocument, Fields, Orientation, TemplateDefinition } from '../types/template'
import { EMPTY_FIELDS, layoutContext, pageSize, remapElement } from '../utils/document'
import { getTemplate } from './index'

/** A fresh document built from a template and its sample content. */
export function documentFromTemplate(
  template: TemplateDefinition,
  orientation: Orientation = template.orientation,
): CoverDocument {
  const ctx = layoutContext(orientation)
  const fields: Fields = { ...EMPTY_FIELDS, ...template.defaults }
  return {
    templateId: template.id,
    orientation,
    background: template.background(ctx),
    palette: { ...template.palette },
    fonts: { ...template.fonts },
    fields,
    elements: template.layout(ctx),
  }
}

/**
 * Switches a document to another template while keeping what the user typed:
 * the form fields, uploaded logo and image, and any elements they added.
 */
export function applyTemplate(doc: CoverDocument, template: TemplateDefinition): CoverDocument {
  const ctx = layoutContext(template.orientation)
  const from = pageSize(doc.orientation)
  const custom = doc.elements.filter((e) => e.custom).map((e) => remapElement(e, from, ctx))
  return {
    templateId: template.id,
    orientation: template.orientation,
    background: template.background(ctx),
    palette: { ...template.palette },
    fonts: { ...template.fonts },
    fields: {
      ...doc.fields,
      // keep the user's images; fall back to the template's illustration if they had none
      image: doc.fields.image ?? template.defaults.image ?? null,
    },
    elements: [...template.layout(ctx), ...custom],
  }
}

/** Re-lays the template for the new orientation; styles and content are preserved. */
export function changeOrientation(doc: CoverDocument, orientation: Orientation): CoverDocument {
  if (doc.orientation === orientation) return doc
  const template = getTemplate(doc.templateId)
  const ctx = layoutContext(orientation)
  const from = pageSize(doc.orientation)
  const custom = doc.elements.filter((e) => e.custom).map((e) => remapElement(e, from, ctx))
  return {
    ...doc,
    orientation,
    elements: [...template.layout(ctx), ...custom],
  }
}
