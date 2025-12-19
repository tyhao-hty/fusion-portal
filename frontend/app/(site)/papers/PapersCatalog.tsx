"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Paper } from "./types";

type SectionDefinition = {
  title: string;
  key?: string;
  children?: SectionDefinition[];
};

const SECTION_DEFINITIONS: SectionDefinition[] = [
  { title: "经典理论论文", key: "经典理论论文" },
  {
    title: "磁约束聚变",
    children: [
      { title: "托卡马克物理", key: "托卡马克物理" },
      { title: "仿星器物理", key: "仿星器物理" },
    ],
  },
  { title: "惯性约束聚变", key: "惯性约束聚变" },
  { title: "等离子体物理基础", key: "等离子体物理基础" },
  { title: "材料科学与工程", key: "材料科学与工程" },
  { title: "聚变堆设计与技术", key: "聚变堆设计与技术" },
  { title: "先进约束概念", key: "先进约束概念" },
  { title: "最新研究进展", key: "最新研究进展" },
];

const SECTION_KEYS = SECTION_DEFINITIONS.flatMap((section) => {
  if (section.children?.length) {
    return section.children
      .map((child) => child.key)
      .filter((key): key is string => Boolean(key));
  }
  return section.key ? [section.key] : [];
});

const TAG_KEYS = new Set(SECTION_KEYS);

const FALLBACK_KEY = "__other__";
const PAPERS_STORAGE_KEY = "fusion-site:papers-filters";

type PapersCatalogProps = {
  papers: Paper[];
  initialMeta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
  };
  initialError?: string | null;
};

function getPrimaryTag(paper: Paper) {
  return paper.tags
    .map((tag) => tag.name)
    .find((tagName) => TAG_KEYS.has(tagName)) ?? null;
}

export function PapersCatalog({ papers, initialMeta, initialError = null }: PapersCatalogProps) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [sort, setSort] = useState("year_desc");
  const hasHydratedFilters = useRef(false);
  const [paperList, setPaperList] = useState<Paper[]>(papers);
  const [meta, setMeta] = useState<PapersCatalogProps["initialMeta"] | undefined>(initialMeta);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const allTags = useMemo(() => {
    const map = new Map<string, string>();
    paperList.forEach((paper) => {
      paper.tags.forEach((tag) => {
        map.set(tag.slug, tag.name);
      });
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [paperList]);

  const grouped = useMemo(() => {
    const map = new Map<string, Paper[]>();
    TAG_KEYS.forEach((key) => {
      map.set(key, []);
    });
    const fallback: Paper[] = [];

    for (const paper of paperList) {
      const primaryTag = getPrimaryTag(paper);
      if (primaryTag) {
        map.get(primaryTag)?.push(paper);
      } else {
        fallback.push(paper);
      }
    }

    if (fallback.length) {
      map.set(FALLBACK_KEY, fallback);
    }

    return map;
  }, [paperList]);

  const displayedCount = useMemo(
    () => Array.from(grouped.values()).reduce((sum, items) => sum + items.length, 0),
    [grouped],
  );

  const hasResults = displayedCount > 0;
  const totalCount = meta?.total ?? paperList.length;

  const resetFilters = () => {
    setQuery("");
    setSelectedTags([]);
    setYearFrom("");
    setYearTo("");
    setSort("year_desc");
  };

  useEffect(() => {
    if (hasHydratedFilters.current) return;
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(PAPERS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        query?: string;
        selectedTags?: string[];
        yearFrom?: string;
        yearTo?: string;
        sort?: string;
      };
      setQuery(parsed.query ?? "");
      setSelectedTags(parsed.selectedTags ?? []);
      setYearFrom(parsed.yearFrom ?? "");
      setYearTo(parsed.yearTo ?? "");
      setSort(parsed.sort ?? "year_desc");
    } catch (hydrateError) {
      console.warn("[PapersCatalog] Failed to load saved filters", hydrateError);
    } finally {
      hasHydratedFilters.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedFilters.current) return;
    if (typeof window === "undefined") return;
    const payload = {
      query,
      selectedTags,
      yearFrom,
      yearTo,
      sort,
    };
    localStorage.setItem(PAPERS_STORAGE_KEY, JSON.stringify(payload));
  }, [query, selectedTags, sort, yearFrom, yearTo]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchPapers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          // Phase 6 transitional: align SSR/CSR limits until pagination UI is ready.
          limit: "100",
          sort,
        });
        if (query.trim()) params.set("q", query.trim());
        if (yearFrom.trim()) params.set("yearFrom", yearFrom.trim());
        if (yearTo.trim()) params.set("yearTo", yearTo.trim());
        const tagFilters = Array.from(new Set(selectedTags)).filter(Boolean);
        if (tagFilters.length) {
          params.set("tags", tagFilters.join(","));
        }
        const response = await fetch(`/api/bff/papers?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`加载论文失败：HTTP ${response.status}`);
        }
        const payload = (await response.json()) as { data: Paper[]; meta?: PapersCatalogProps["initialMeta"] };
        setPaperList(payload.data);
        setMeta(payload.meta);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        const message = fetchError instanceof Error ? fetchError.message : "加载论文失败";
        setError(message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPapers();
    return () => controller.abort();
  }, [query, selectedTags, sort, yearFrom, yearTo]);

  return (
    <section aria-label="核聚变论文列表">
      <div className="paper-filters">
        <input
          type="search"
          className="paper-search"
          placeholder="搜索论文标题、作者或关键词…"
          aria-label="搜索核聚变论文"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="paper-filter-row">
          <label className="paper-filter">
            年份起
            <input
              type="number"
              inputMode="numeric"
              placeholder="起始年份"
              value={yearFrom}
              onChange={(event) => setYearFrom(event.target.value)}
            />
          </label>
          <label className="paper-filter">
            年份止
            <input
              type="number"
              inputMode="numeric"
              placeholder="结束年份"
              value={yearTo}
              onChange={(event) => setYearTo(event.target.value)}
            />
          </label>
          <label className="paper-filter">
            排序
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="year_desc">年份从新到旧</option>
              <option value="year_asc">年份从旧到新</option>
              <option value="name_asc">标题 A → Z</option>
              <option value="name_desc">标题 Z → A</option>
            </select>
          </label>
        </div>
        <div className="paper-tags">
          <div className="paper-tags-title">标签筛选（可多选）</div>
          <div className="paper-tags-grid">
            {allTags.map((tag) => {
              const checked = selectedTags.includes(tag.slug) || selectedTags.includes(tag.name);
              return (
                <label key={tag.slug} className="paper-tag-chip">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => {
                      const value = tag.slug;
                      setSelectedTags((prev) => {
                        if (event.target.checked) {
                          return Array.from(new Set([...prev, value, tag.name]));
                        }
                        return prev.filter((item) => item !== value && item !== tag.name);
                      });
                    }}
                  />
                  {tag.name}
                </label>
              );
            })}
          </div>
        </div>
        <div className="paper-filter-actions">
          <button
            type="button"
            className="load-more-button load-more-button--ghost"
            onClick={resetFilters}
          >
            重置筛选
          </button>
          <span className="paper-status" aria-live="polite">
            {selectedTags.length || yearFrom || yearTo || query
              ? "已启用筛选"
              : "未启用筛选"}
          </span>
        </div>
      </div>
      <p className="paper-status" aria-live="polite">
        {hasResults
          ? `当前展示 ${displayedCount} / ${totalCount} 篇论文`
          : "未找到符合条件的论文，请调整筛选或关键词。"}
        {loading ? "（加载中…）" : null} {error ? `（最近一次请求失败：${error}）` : null}
      </p>

      {SECTION_DEFINITIONS.map((section) => {
        if (section.children && section.children.length) {
          const childNodes = section.children
            .map((child) => {
              if (!child.key) return null;
              const items = grouped.get(child.key) ?? [];
              if (!items.length) return null;
              return (
                <div key={child.key}>
                  <h3>{child.title}</h3>
                  <div className="paper-list">
                    {items.map((paper) => (
                      <PaperCard key={paper.slug} paper={paper} />
                    ))}
                  </div>
                </div>
              );
            })
            .filter(Boolean);

          if (!childNodes.length) {
            return null;
          }

          return (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {childNodes}
            </section>
          );
        }

        if (!section.key) {
          return null;
        }

        const items = grouped.get(section.key) ?? [];

        if (!items.length) {
          return null;
        }

        return (
          <section key={section.key}>
            <h2>{section.title}</h2>
            <div className="paper-list">
              {items.map((paper) => (
                <PaperCard key={paper.slug} paper={paper} />
              ))}
            </div>
          </section>
        );
      })}

      {grouped.has(FALLBACK_KEY) && (
        <section>
          <h2>其他主题</h2>
          <div className="paper-list">
            {(grouped.get(FALLBACK_KEY) ?? []).map((paper) => (
              <PaperCard key={paper.slug} paper={paper} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  const [expanded, setExpanded] = useState(false);
  const yearVenue = [paper.venue, paper.year ? String(paper.year) : null].filter(Boolean).join(", ");
  const abstract = paper.abstract ?? "";
  const shouldTruncate = abstract.length > 180;
  const displayedAbstract = expanded || !shouldTruncate ? abstract : `${abstract.slice(0, 180)}…`;

  return (
    <article className="paper-card">
      <div className="paper-title">{paper.title}</div>
      <div className="paper-authors">{paper.authors}</div>
      {yearVenue ? <div className="paper-journal">{yearVenue}</div> : null}
      {abstract ? (
        <p>
          {displayedAbstract}{" "}
          {shouldTruncate ? (
            <button
              type="button"
              className="paper-toggle"
              onClick={() => setExpanded((open) => !open)}
              aria-label={expanded ? "收起摘要" : "展开摘要"}
            >
              {expanded ? "收起" : "展开"}
            </button>
          ) : null}
        </p>
      ) : null}
      {paper.url ? (
        <a className="paper-link" href={paper.url} target="_blank" rel="noopener noreferrer">
          查看原文
        </a>
      ) : null}
    </article>
  );
}
