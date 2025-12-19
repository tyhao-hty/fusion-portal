import type {
  LinkRecord,
  GroupRecord,
  SectionRecord,
  NestedSection,
} from './types'

export type AssemblyResult = {
  sections: NestedSection[]
  flat: Array<{
    slug: string
    name: string
    url: string
    description: string | null
    sortOrder: number
    section: { slug: string; title: string }
    group: { slug: string; title: string | null }
  }>
  counts: { sections: number; groups: number; links: number }
}

export function assembleLinks(options: {
  links: LinkRecord[]
  groups: GroupRecord[]
  sections: SectionRecord[]
}): AssemblyResult {
  const { links, groups, sections } = options

  const resolveKey = (slug?: string | null, id?: number | string | null) => {
    if (slug && String(slug).trim().length > 0) return String(slug)
    if (id !== undefined && id !== null) return String(id)
    return null
  }

  const groupMap = new Map<
    string,
    {
      slug: string
      title: string | null
      sortOrder: number
      createdAt: number
      sectionSlug: string | null
      links: {
        slug: string
        name: string
        url: string
        description: string | null
        sortOrder: number
        createdAt: number
      }[]
    }
  >()

  const sectionMap = new Map<
    string,
    {
      slug: string
      title: string
      sortOrder: number
      createdAt: number
      groups: string[]
    }
  >()

  const toNumberDesc = (value: number | null | undefined, fallback: number) =>
    typeof value === 'number' && !Number.isNaN(value) ? value : fallback

  // Build section map
  sections.forEach((section) => {
    const key = resolveKey(section.slug, section.id)
    if (!key) return
    sectionMap.set(key, {
      slug: section.slug ? String(section.slug) : key,
      title: section.title,
      sortOrder: toNumberDesc(section.sortOrder, 0),
      createdAt: toNumberDesc(section.createdAt ? Date.parse(section.createdAt) : null, 0),
      groups: [],
    })
  })

  // Build group map
  groups.forEach((group) => {
    const key = resolveKey(group.slug, group.id)
    if (!key) return
    const sectionKey = resolveKey(group.section?.slug ?? null, group.section?.id ?? null)
    groupMap.set(key, {
      slug: group.slug ? String(group.slug) : key,
      title: group.title ?? null,
      sortOrder: toNumberDesc(group.sortOrder, 0),
      createdAt: toNumberDesc(group.createdAt ? Date.parse(group.createdAt) : null, 0),
      sectionSlug: sectionKey,
      links: [],
    })
  })

  // Attach links to groups
  links.forEach((link) => {
    const groupKey = resolveKey(link.group?.slug ?? null, link.group?.id ?? null)
    if (!groupKey) return
    const group = groupMap.get(groupKey)
    if (!group) return

    group.links.push({
      slug: link.slug,
      name: link.name,
      url: link.url,
      description: link.description ?? null,
      sortOrder: toNumberDesc(link.sortOrder, 0),
      createdAt: toNumberDesc(link.createdAt ? Date.parse(link.createdAt) : null, 0),
    })
  })

  // Prune empty groups and attach to sections
  groupMap.forEach((group, groupSlug) => {
    if (group.links.length === 0) {
      groupMap.delete(groupSlug)
      return
    }
    const sectionKey = group.sectionSlug
    if (!sectionKey) {
      groupMap.delete(groupSlug)
      return
    }
    const section = sectionMap.get(sectionKey)
    if (!section) {
      groupMap.delete(groupSlug)
      return
    }
    section.groups.push(groupSlug)
  })

  // Prune empty sections
  for (const [sectionSlug, section] of sectionMap.entries()) {
    if (section.groups.length === 0) {
      sectionMap.delete(sectionSlug)
    }
  }

  // Build nested structure
  const sortedSections = Array.from(sectionMap.entries()).sort((a, b) => {
    const [, sectionA] = a
    const [, sectionB] = b
    if (sectionA.sortOrder !== sectionB.sortOrder) return sectionB.sortOrder - sectionA.sortOrder
    return sectionB.createdAt - sectionA.createdAt
  })

  const nestedSections: NestedSection[] = sortedSections.map(([, section]) => {
    const sortedGroups = section.groups
      .map((groupSlug) => [groupSlug, groupMap.get(groupSlug)!] as const)
      .sort((a, b) => {
        const groupA = a[1]
        const groupB = b[1]
        if (groupA.sortOrder !== groupB.sortOrder) return groupB.sortOrder - groupA.sortOrder
        return groupB.createdAt - groupA.createdAt
      })

    const groups = sortedGroups.map(([groupSlug, group]) => {
      const links = [...group.links].sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return b.sortOrder - a.sortOrder
        return b.createdAt - a.createdAt
      })

      return {
        slug: groupSlug,
        title: group.title,
        sortOrder: group.sortOrder,
        links: links.map((link) => ({
          slug: link.slug,
          name: link.name,
          url: link.url,
          description: link.description,
          sortOrder: link.sortOrder,
        })),
      }
    })

    return {
      slug: section.slug,
      title: section.title,
      sortOrder: section.sortOrder,
      groups,
    }
  })

  const flat: AssemblyResult['flat'] = []
  nestedSections.forEach((section) => {
    section.groups.forEach((group) => {
      group.links.forEach((link) => {
        flat.push({
          slug: link.slug,
          name: link.name,
          url: link.url,
          description: link.description,
          sortOrder: link.sortOrder,
          section: { slug: section.slug, title: section.title },
          group: { slug: group.slug, title: group.title },
        })
      })
    })
  })

  const counts = {
    sections: nestedSections.length,
    groups: nestedSections.reduce((sum, s) => sum + s.groups.length, 0),
    links: nestedSections.reduce(
      (sum, s) => sum + s.groups.reduce((gSum, g) => gSum + g.links.length, 0),
      0,
    ),
  }

  return {
    sections: nestedSections,
    flat,
    counts,
  }
}
