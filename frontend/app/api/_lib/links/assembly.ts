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

  const groupMap = new Map<
    string,
    {
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
    const slug = String(section.slug)
    sectionMap.set(slug, {
      title: section.title,
      sortOrder: toNumberDesc(section.sortOrder, 0),
      createdAt: toNumberDesc(section.createdAt ? Date.parse(section.createdAt) : null, 0),
      groups: [],
    })
  })

  // Build group map
  groups.forEach((group) => {
    const slug = String(group.slug)
    const sectionSlug = group.section?.slug ? String(group.section.slug) : null
    groupMap.set(slug, {
      title: group.title ?? null,
      sortOrder: toNumberDesc(group.sortOrder, 0),
      createdAt: toNumberDesc(group.createdAt ? Date.parse(group.createdAt) : null, 0),
      sectionSlug,
      links: [],
    })
  })

  // Attach links to groups
  links.forEach((link) => {
    const groupSlug = link.group?.slug ? String(link.group.slug) : null
    if (!groupSlug) return
    const group = groupMap.get(groupSlug)
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
    const sectionSlug = group.sectionSlug
    if (!sectionSlug) {
      groupMap.delete(groupSlug)
      return
    }
    const section = sectionMap.get(sectionSlug)
    if (!section) {
      groupMap.delete(groupSlug)
      return
    }
    section.groups.push(groupSlug)
  })

  // Prune empty sections
  sectionMap.forEach((section, sectionSlug) => {
    if (section.groups.length === 0) {
      sectionMap.delete(sectionSlug)
    }
  })

  // Build nested structure
  const sortedSections = Array.from(sectionMap.entries()).sort((a, b) => {
    const [, sectionA] = a
    const [, sectionB] = b
    if (sectionA.sortOrder !== sectionB.sortOrder) return sectionB.sortOrder - sectionA.sortOrder
    return sectionB.createdAt - sectionA.createdAt
  })

  const nestedSections: NestedSection[] = sortedSections.map(([sectionSlug, section]) => {
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
      slug: sectionSlug,
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
