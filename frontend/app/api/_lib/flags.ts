export function shouldUseTimelinePayload(): boolean {
  return process.env.BFF_TIMELINE_USE_PAYLOAD !== 'false'
}

export function shouldUseLinksPayload(): boolean {
  return process.env.BFF_LINKS_USE_PAYLOAD !== 'false'
}

export function shouldUsePapersPayload(): boolean {
  return process.env.BFF_PAPERS_USE_PAYLOAD !== 'false'
}

export function shouldUseArticlesPayload(): boolean {
  return process.env.BFF_ARTICLES_USE_PAYLOAD !== 'false'
}

// Legacy hook-style exports retained for compatibility; avoid using in API routes.
export const useTimelinePayload = shouldUseTimelinePayload
export const useLinksPayload = shouldUseLinksPayload
export const usePapersPayload = shouldUsePapersPayload
export const useArticlesPayload = shouldUseArticlesPayload
