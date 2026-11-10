import type { CoverDocument, Orientation } from '../../types/template'
import { useThumbnail } from '../../hooks/useThumbnail'
import { previewFill } from '../../utils/renderer'
import { cn } from '../ui/cn'

/** A4-proportioned preview of a document, rendered by the same engine as the editor. */
export function CoverThumb({
  cacheKey,
  getDoc,
  orientation,
  className,
  alt,
}: {
  cacheKey: string
  getDoc: () => CoverDocument
  orientation: Orientation
  className?: string
  alt: string
}) {
  const url = useThumbnail(cacheKey, getDoc)
  return (
    <div
      className={cn('relative overflow-hidden rounded-md bg-white shadow-card ring-1 ring-black/5', className)}
      style={{ aspectRatio: orientation === 'portrait' ? '210 / 297' : '297 / 210', background: url ? undefined : previewFill(getDoc()) }}
    >
      {url ? (
        <img src={url} alt={alt} className="absolute inset-0 size-full animate-[fade-up_0.35s_ease-out_both] object-cover" draggable={false} />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-white/40" />
      )}
    </div>
  )
}
