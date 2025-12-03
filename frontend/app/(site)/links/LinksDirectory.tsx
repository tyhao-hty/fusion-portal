"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LinkGroup, LinkItem, LinkSection } from "./types";

type PreparedLink = LinkItem & {
  searchText: string;
  sectionTitle: string;
  groupTitle: string | null;
};

type PreparedGroup = {
  slug: string;
  title: string | null;
  sortOrder: number;
  links: PreparedLink[];
};

type PreparedSection = {
  slug: string;
  title: string;
  sortOrder: number;
  groups: PreparedGroup[];
};

type LinksDirectoryProps = {
  sections: LinkSection[];
  initialMeta?: {
    sectionCount: number;
    groupCount: number;
    linkCount: number;
  };
  initialError?: string | null;
};

const SECTION_PAGE_SIZE = 3;
const FLAT_PAGE_SIZE = 12;
const LINKS_STORAGE_KEY = "fusion-site:links-state";
const LOAD_THROTTLE_MS = 400;

export function LinksDirectory({ sections, initialMeta, initialError = null }: LinksDirectoryProps) {
  const [sectionFilter, setSectionFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"nested" | "flat">("nested");
  const [visibleSectionCount, setVisibleSectionCount] = useState(SECTION_PAGE_SIZE);
  const [visibleFlatCount, setVisibleFlatCount] = useState(FLAT_PAGE_SIZE);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const hasHydratedFilters = useRef(false);
  const [sectionsData, setSectionsData] = useState<PreparedSection[]>([]);
  const [meta, setMeta] = useState<LinksDirectoryProps["initialMeta"] | undefined>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const lastLoadRef = useRef(0);

  const preparedSections = useMemo<PreparedSection[]>(() => {
    return sections.map((section) => ({
      slug: section.slug,
      title: section.title,
      sortOrder: section.sortOrder,
      groups: section.groups.map((group) => ({
        slug: group.slug,
        title: group.title,
        sortOrder: group.sortOrder,
        links: group.links.map((link) => ({
          ...link,
          description: link.description ?? "",
          sectionTitle: section.title,
          groupTitle: group.title ?? null,
          searchText: [
            section.title,
            group.title ?? "",
            link.name,
            link.description ?? "",
          ]
            .join(" ")
            .toLowerCase(),
        })),
      })),
    }));
  }, [sections]);

  const allGroups = useMemo(
    () =>
      sectionsData.flatMap((section) =>
        section.groups.map((group) => ({
          slug: group.slug,
          title: group.title,
          sectionSlug: section.slug,
        })),
      ),
    [sectionsData],
  );

  useEffect(() => {
    setSectionsData(preparedSections);
  }, [preparedSections]);

  useEffect(() => {
    setVisibleSectionCount(SECTION_PAGE_SIZE);
    setVisibleFlatCount(FLAT_PAGE_SIZE);
  }, [sectionFilter, groupFilter, viewMode]);

  const displayedSections = sectionsData.slice(0, visibleSectionCount);
  const flatLinks = sectionsData.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.links.map((link) => ({
        ...link,
        sectionTitle: section.title,
        groupTitle: group.title,
      })),
    ),
  );
  const displayedFlatLinks = flatLinks.slice(0, visibleFlatCount);

  const hasMore =
    viewMode === "flat"
      ? visibleFlatCount < flatLinks.length
      : visibleSectionCount < sectionsData.length;
  const hasResults = viewMode === "flat" ? flatLinks.length > 0 : sectionsData.length > 0;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (viewMode === "flat") {
              setVisibleFlatCount((count) => Math.min(count + FLAT_PAGE_SIZE, flatLinks.length));
            } else {
              setVisibleSectionCount((count) => Math.min(count + 1, sectionsData.length));
            }
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [flatLinks.length, hasMore, sectionsData.length, viewMode]);

  const handleLoadMore = () => {
    const now = Date.now();
    if (now - lastLoadRef.current < LOAD_THROTTLE_MS) return;
    lastLoadRef.current = now;
    if (viewMode === "flat") {
      setVisibleFlatCount((count) => Math.min(count + FLAT_PAGE_SIZE, flatLinks.length));
    } else {
      setVisibleSectionCount((count) => Math.min(count + 1, sectionsData.length));
    }
  };

  const resetFilters = () => {
    setQuery("");
    setSectionFilter("all");
    setGroupFilter("all");
    setViewMode("nested");
    setCollapsedSections(new Set());
  };

  const renderedCount = viewMode === "flat" ? displayedFlatLinks.length : displayedSections.length;

  const groupOptions = useMemo(() => {
    if (sectionFilter === "all") {
      return allGroups;
    }
    return allGroups.filter((group) => group.sectionSlug === sectionFilter);
  }, [allGroups, sectionFilter]);

  useEffect(() => {
    if (hasHydratedFilters.current) return;
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(LINKS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        query?: string;
        sectionFilter?: string;
        groupFilter?: string;
        viewMode?: "nested" | "flat";
      };
      setQuery(parsed.query ?? "");
      setSectionFilter(parsed.sectionFilter ?? "all");
      setGroupFilter(parsed.groupFilter ?? "all");
      setViewMode(parsed.viewMode === "flat" ? "flat" : "nested");
    } catch (hydrateError) {
      console.warn("[LinksDirectory] Failed to load saved filters", hydrateError);
    } finally {
      hasHydratedFilters.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedFilters.current) return;
    if (typeof window === "undefined") return;
    const payload = {
      query,
      sectionFilter,
      groupFilter,
      viewMode,
    };
    localStorage.setItem(LINKS_STORAGE_KEY, JSON.stringify(payload));
  }, [groupFilter, query, sectionFilter, viewMode]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const params = new URLSearchParams();
        if (sectionFilter !== "all") params.set("section", sectionFilter);
        if (groupFilter !== "all") params.set("group", groupFilter);
        if (query.trim()) params.set("q", query.trim());
        const response = await fetch(`${baseUrl}/api/links?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`加载资源失败：HTTP ${response.status}`);
        }
        const payload = (await response.json()) as { data: LinkSection[]; meta?: typeof initialMeta };
        const prepared = payload.data.map((section) => ({
          slug: section.slug,
          title: section.title,
          sortOrder: section.sortOrder,
          groups: section.groups.map((group) => ({
            slug: group.slug,
            title: group.title,
            sortOrder: group.sortOrder,
            links: group.links.map((link) => ({
              ...link,
              description: link.description ?? "",
              sectionTitle: section.title,
              groupTitle: group.title ?? null,
              searchText: [section.title, group.title ?? "", link.name, link.description ?? ""]
                .join(" ")
                .toLowerCase(),
            })),
          })),
        }));
        setSectionsData(prepared);
        setMeta(payload.meta);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        const message = fetchError instanceof Error ? fetchError.message : "加载资源失败";
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchLinks();
    return () => controller.abort();
  }, [groupFilter, query, sectionFilter]);

  return (
    <>
      <div className="links-search-wrapper">
        <div className="links-filters">
          <label className="links-filter">
            分类
            <select
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
              aria-label="选择资源分类"
            >
              <option value="all">全部分类</option>
              {preparedSections.map((section) => (
                <option key={section.slug} value={section.slug}>
                  {section.title}
                </option>
              ))}
            </select>
          </label>
          <label className="links-filter">
            分组
            <select
              value={groupFilter}
              onChange={(event) => setGroupFilter(event.target.value)}
              aria-label="选择资源分组"
            >
              <option value="all">全部分组</option>
              {groupOptions.map((group) => (
                <option key={group.slug} value={group.slug}>
                  {group.title ?? group.slug}
                </option>
              ))}
            </select>
          </label>
          <label className="links-filter">
            视图
            <select
              value={viewMode}
              onChange={(event) => setViewMode(event.target.value as "nested" | "flat")}
              aria-label="选择展示视图"
            >
              <option value="nested">分组展示</option>
              <option value="flat">扁平列表</option>
            </select>
          </label>
        </div>
        <input
          type="search"
          className="paper-search"
          placeholder="搜索资源名称或简介…"
          aria-label="搜索聚变资源"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="links-filter-actions">
          <span className="links-filter-active" aria-live="polite">
            {query || sectionFilter !== "all" || groupFilter !== "all"
              ? "已应用筛选"
              : "未启用筛选"}
          </span>
          <button type="button" className="load-more-button load-more-button--ghost" onClick={resetFilters}>
            重置筛选
          </button>
        </div>
      </div>

      <p className="paper-status" aria-live="polite">
        📊 资源统计：共收录 <strong>{meta?.linkCount ?? flatLinks.length}</strong> 个站点，覆盖{" "}
        <strong>{meta?.sectionCount ?? sectionsData.length}</strong> 个主题分类；当前展示{" "}
        <strong>{viewMode === "flat" ? flatLinks.length : sectionsData.length}</strong> 个结果。
        {loading ? "（加载中…）" : null} {error ? `（最近一次请求失败：${error}）` : null}
      </p>

      {!hasResults ? (
        <div className="links-empty" role="status">
          未找到与当前筛选条件匹配的资源，请尝试修改关键词/分类或点击“重置筛选”。
        </div>
      ) : (
        <>
          {viewMode === "flat" ? (
            <div className="links-grid">
              {displayedFlatLinks.map((link) => (
                <FlatLinkCard key={link.slug} link={link} />
              ))}
            </div>
          ) : (
            <div>
              {displayedSections.map((section) => (
                <Section
                  key={section.slug}
                  section={section}
                  isCollapsed={collapsedSections.has(section.slug)}
                  onToggle={() => {
                    setCollapsedSections((current) => {
                      const next = new Set(current);
                      if (next.has(section.slug)) {
                        next.delete(section.slug);
                      } else {
                        next.add(section.slug);
                      }
                      return next;
                    });
                  }}
                />
              ))}
            </div>
          )}
          <div className="links-controls">
            <button
              type="button"
              className="load-more-button"
              onClick={handleLoadMore}
              disabled={!hasMore}
              aria-disabled={!hasMore}
            >
              {hasMore ? "加载更多资源" : "已经到底啦"}
            </button>
            <p className="links-status" aria-live="polite">
              {viewMode === "flat"
                ? `已展示 ${renderedCount} / ${flatLinks.length} 条资源`
                : `已展示 ${renderedCount} / ${sectionsData.length} 个分类`}
            </p>
          </div>
          <div ref={sentinelRef} className="links-sentinel" aria-hidden="true" />
        </>
      )}
    </>
  );
}

function Section({
  section,
  isCollapsed,
  onToggle,
}: {
  section: PreparedSection;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <section className="links-section">
      <div className="links-section-header">
        <h2>{section.title}</h2>
        <button type="button" className="link-collapse" onClick={onToggle}>
          {isCollapsed ? "展开" : "折叠"}
        </button>
      </div>
      {!isCollapsed &&
        section.groups.map((group) => (
          <div key={group.slug}>
            {group.title ? <h3>{group.title}</h3> : null}
            <div className="links-grid">
              {group.links.map((link) => (
                <a
                  key={link.slug}
                  className="link-card"
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="link-title">{link.name}</div>
                  <div className="link-description">{link.description}</div>
                </a>
              ))}
            </div>
          </div>
        ))}
    </section>
  );
}

function FlatLinkCard({
  link,
}: {
  link: PreparedLink & { sectionTitle: string; groupTitle: string | null };
}) {
  return (
    <a className="link-card" href={link.url} target="_blank" rel="noopener noreferrer">
      <div className="link-title">{link.name}</div>
      <div className="link-description">{link.description}</div>
      <div className="link-meta">
        {link.sectionTitle}
        {link.groupTitle ? ` / ${link.groupTitle}` : ""}
      </div>
    </a>
  );
}
