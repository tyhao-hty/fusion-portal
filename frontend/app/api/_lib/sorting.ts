export function timelineSort(order: 'asc' | 'desc'): string[] {
  const prefix = order === 'asc' ? '' : '-'
  return [`${prefix}sortOrder`, `${prefix}id`]
}
