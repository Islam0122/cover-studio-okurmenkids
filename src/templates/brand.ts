import okurmenKidsLogo from '../assets/brand/okurmen-kids-logo.png'

export interface BrandAsset {
  id: string
  name: string
  /** Bundled asset URL — stored by reference, so projects stay small in LocalStorage. */
  src: string
}

export const BRAND_LOGOS: BrandAsset[] = [{ id: 'okurmen-kids', name: 'Окурмэн Kids', src: okurmenKidsLogo }]

export const OKURMEN_KIDS_LOGO = okurmenKidsLogo
