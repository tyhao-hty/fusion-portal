import type { PapersSort } from './types'

export function mapPapersSort(sort: PapersSort): string[] {
  if (sort === 'year_asc') {
    return ['year', '-sortOrder', '-createdAt']
  }
  if (sort === 'name_asc') {
    return ['title', '-year', '-createdAt']
  }
  if (sort === 'name_desc') {
    return ['-title', '-year', '-createdAt']
  }
  return ['-year', '-sortOrder', '-createdAt']
}
