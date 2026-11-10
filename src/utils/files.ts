/** Reads an uploaded image and downsizes it so projects fit in LocalStorage. */
export interface ReadImageOptions {
  /** Makes the paper behind a photographed stamp or signature transparent. */
  knockout?: boolean
}

export async function readImageFile(file: File, maxSide = 1800, options: ReadImageOptions = {}): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Выберите файл изображения (PNG, JPG, SVG, WebP)')
  if (file.size > 15 * 1024 * 1024) throw new Error('Файл больше 15 МБ')
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsDataURL(file)
  })
  if (file.type === 'image/svg+xml') return dataUrl

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('Изображение повреждено или не поддерживается'))
    el.src = dataUrl
  })
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, w, h)
  if (options.knockout) {
    knockoutBackground(ctx, w, h)
    return encode(canvas, true)
  }
  // keep transparency for logos (PNG/WebP/GIF), use JPEG for photos
  const transparent = file.type !== 'image/jpeg'
  return transparent ? encode(canvas, true) : canvas.toDataURL('image/jpeg', 0.9)
}

/**
 * Estimates the paper colour from the image border and fades every pixel by its
 * distance from it, so only the ink of a scanned stamp or signature remains.
 */
function knockoutBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const data = ctx.getImageData(0, 0, w, h)
  const px = data.data
  // already transparent (e.g. a prepared PNG): nothing to remove
  let clear = 0
  let total = 0
  for (let x = 0; x < w; x += 4) {
    for (const y of [0, h - 1]) {
      total++
      if (px[(y * w + x) * 4 + 3] < 16) clear++
    }
  }
  if (clear / total > 0.5) return
  const samples: number[][] = [[], [], []]
  const step = Math.max(1, Math.floor(Math.min(w, h) / 60))
  const take = (x: number, y: number) => {
    const i = (y * w + x) * 4
    samples[0].push(px[i])
    samples[1].push(px[i + 1])
    samples[2].push(px[i + 2])
  }
  for (let x = 0; x < w; x += step) {
    take(x, 0)
    take(x, h - 1)
  }
  for (let y = 0; y < h; y += step) {
    take(0, y)
    take(w - 1, y)
  }
  const median = (a: number[]) => a.sort((p, q) => p - q)[Math.floor(a.length / 2)]
  const [br, bg, bb] = samples.map(median)
  const lo = 28
  const hi = 90
  for (let i = 0; i < px.length; i += 4) {
    const d = Math.hypot(px[i] - br, px[i + 1] - bg, px[i + 2] - bb)
    const a = Math.min(1, Math.max(0, (d - lo) / (hi - lo)))
    if (a < 1) {
      // un-mix the paper colour so faint ink keeps its hue instead of turning grey
      const k = Math.max(a, 0.001)
      px[i] = Math.min(255, Math.max(0, (px[i] - br * (1 - k)) / k))
      px[i + 1] = Math.min(255, Math.max(0, (px[i + 1] - bg * (1 - k)) / k))
      px[i + 2] = Math.min(255, Math.max(0, (px[i + 2] - bb * (1 - k)) / k))
    }
    px[i + 3] = Math.round(px[i + 3] * a)
  }
  ctx.putImageData(data, 0, 0)
}

/**
 * WebP keeps transparency at a fraction of PNG's size; browsers that cannot
 * encode it (older Safari) fall back to PNG automatically.
 */
export function encode(canvas: HTMLCanvasElement, transparent: boolean): string {
  if (transparent) {
    const webp = canvas.toDataURL('image/webp', 0.92)
    if (webp.startsWith('data:image/webp')) return webp
    return canvas.toDataURL('image/png')
  }
  return canvas.toDataURL('image/jpeg', 0.9)
}
