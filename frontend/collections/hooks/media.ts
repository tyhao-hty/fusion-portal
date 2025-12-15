type BeforeChangeArgs = {
  data?: any
}

const buildAlt = (data: any) => data?.title || data?.filename || 'media'

export const ensureAltText = ({ data }: BeforeChangeArgs) => {
  if (!data) return data
  const currentAlt = typeof data.alt === 'string' ? data.alt.trim() : ''
  if (currentAlt) return data

  return { ...data, alt: buildAlt(data) }
}
