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
};

const PAGE_SIZE = 3;

export function LinksDirectory({ sections }: LinksDirectoryProps) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  const totalLinks = useMemo(
    () =>
      preparedSections.reduce(
        (count, section) =>
          count +
          section.groups.reduce((groupCount, group) => groupCount + group.links.length, 0),
        0,
      ),
    [preparedSections],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedQuery) {
      return preparedSections;
    }

    return preparedSections
      .map((section) => {
        const groups = section.groups
          .map((group) => ({
            ...group,
            links: group.links.filter((link) => link.searchText.includes(normalizedQuery)),
          }))
          .filter((group) => group.links.length > 0);

        if (!groups.length) {
          return null;
        }

        return {
          ...section,
          groups,
        };
      })
      .filter((section): section is PreparedSection => Boolean(section));
  }, [normalizedQuery, preparedSections]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [normalizedQuery]);

  const displayedSections = filteredSections.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSections.length;
  const hasResults = filteredSections.length > 0;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCount((count) => Math.min(count + 1, filteredSections.length));
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [filteredSections.length, hasMore]);

  const handleLoadMore = () => {
    setVisibleCount((count) => Math.min(count + 1, filteredSections.length));
  };

  const renderedCount = displayedSections.length;

  return (
    <>
      <div className="links-search-wrapper">
        <input
          type="search"
          className="paper-search"
          placeholder="搜索资源名称或简介…"
          aria-label="搜索聚变资源"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <p className="paper-status" aria-live="polite">
        📊 资源统计：共收录 <strong>{totalLinks}</strong> 个站点，覆盖{" "}
        <strong>{preparedSections.length}</strong> 个主题分类。
      </p>

      {!hasResults ? (
        <div className="links-empty" role="status">
          未找到与 “{query}” 匹配的资源，请调整关键词。
        </div>
      ) : (
        <>
          <div>
            {displayedSections.map((section) => (
              <Section key={section.slug} section={section} />
            ))}
          </div>
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
              已展示 {renderedCount} / {filteredSections.length} 个分类
            </p>
          </div>
          <div ref={sentinelRef} className="links-sentinel" aria-hidden="true" />
        </>
      )}
    </>
  );
}

function Section({ section }: { section: PreparedSection }) {
  return (
    <section className="links-section">
      <h2>{section.title}</h2>
      {section.groups.map((group) => (
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
