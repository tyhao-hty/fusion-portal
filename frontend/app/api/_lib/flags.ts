export function useTimelinePayload(): boolean {
  return process.env.BFF_TIMELINE_USE_PAYLOAD !== 'false'
}

export function useLinksPayload(): boolean {
  return process.env.BFF_LINKS_USE_PAYLOAD !== 'false'
}

export function usePapersPayload(): boolean {
  return process.env.BFF_PAPERS_USE_PAYLOAD !== 'false'
}

export function useArticlesPayload(): boolean {
  return process.env.BFF_ARTICLES_USE_PAYLOAD !== 'false'
}
