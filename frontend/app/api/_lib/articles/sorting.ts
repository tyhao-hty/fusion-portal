import type { ArticlesSort } from './types'

export function mapArticlesSort(sort: ArticlesSort): string[] {
  if (sort === 'published_asc') {
    return ['publishedAt', '-createdAt']
  }
  if (sort === 'title_asc') {
    return ['title', '-createdAt']
  }
  if (sort === 'title_desc') {
    return ['-title', '-createdAt']
  }
  return ['-publishedAt', '-createdAt']
}
