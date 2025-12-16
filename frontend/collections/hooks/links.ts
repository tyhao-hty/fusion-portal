import type { PayloadRequest } from 'payload'

type BeforeChangeArgs = {
  data?: any
  req: PayloadRequest
}

const extractRelationId = (value: any) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value
  if (typeof value === 'object' && value.id) return value.id
  return null
}

export const syncLinkSection = async ({ data, req }: BeforeChangeArgs) => {
  if (!data) return data
  const groupId = extractRelationId(data.group)
  if (!groupId || !req.payload) return data

  try {
    const group = await req.payload.findByID({
      collection: 'link-groups',
      id: groupId,
    })
    if (group?.section) {
      const sectionValue =
        typeof group.section === 'object' && group.section !== null ? (group.section as any).id ?? group.section : group.section
      return { ...data, section: sectionValue }
    }
  } catch (error) {
    console.error('links: syncLinkSection failed', error)
  }

  return data
}
