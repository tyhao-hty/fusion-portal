"use client";

import { useMemo, useState } from "react";
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

type PreparedPaper = Paper & {
  searchText: string;
};

type PapersCatalogProps = {
  papers: Paper[];
};

const buildSearchText = (paper: Paper) =>
  [
    paper.title,
    paper.authors,
    paper.venue ?? "",
    paper.year ? String(paper.year) : "",
    paper.abstract ?? "",
    paper.tags.map((tag) => tag.name).join(" "),
  ]
    .join(" ")
    .toLowerCase();

function getPrimaryTag(paper: Paper) {
  return paper.tags
    .map((tag) => tag.name)
    .find((tagName) => TAG_KEYS.has(tagName)) ?? null;
}

export function PapersCatalog({ papers }: PapersCatalogProps) {
  const [query, setQuery] = useState("");

  const prepared = useMemo<PreparedPaper[]>(
    () =>
      papers.map((paper) => ({
        ...paper,
        searchText: buildSearchText(paper),
      })),
    [papers],
  );

  const totalCount = prepared.length;

  const grouped = useMemo(() => {
    const map = new Map<string, PreparedPaper[]>();
    TAG_KEYS.forEach((key) => {
      map.set(key, []);
    });
    const fallback: PreparedPaper[] = [];

    for (const paper of prepared) {
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
  }, [prepared]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return grouped;
    }
    const map = new Map<string, PreparedPaper[]>();
    grouped.forEach((items, key) => {
      const matches = items.filter((item) => item.searchText.includes(normalizedQuery));
      if (matches.length) {
        map.set(key, matches);
      }
    });
    return map;
  }, [grouped, normalizedQuery]);

  const displayedCount = useMemo(
    () => Array.from(filtered.values()).reduce((sum, items) => sum + items.length, 0),
    [filtered],
  );

  const hasResults = filtered.size > 0;

  return (
    <section aria-label="核聚变论文列表">
      <input
        type="search"
        className="paper-search"
        placeholder="搜索论文标题、作者或关键词…"
        aria-label="搜索核聚变论文"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <p className="paper-status" aria-live="polite">
        {normalizedQuery ? (
          hasResults ? (
            <>共找到 {displayedCount} 篇符合 “{query}” 的论文</>
          ) : (
            <>未找到与 “{query}” 匹配的论文，请尝试调整关键词。</>
          )
        ) : (
          <>当前收录 {totalCount} 篇论文，支持按主题浏览与关键词检索。</>
        )}
      </p>

      {SECTION_DEFINITIONS.map((section) => {
        if (section.children && section.children.length) {
          const childNodes = section.children
            .map((child) => {
              if (!child.key) return null;
              const items = filtered.get(child.key) ?? [];
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

        const items = filtered.get(section.key) ?? [];

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

      {filtered.has(FALLBACK_KEY) && (
        <section>
          <h2>其他主题</h2>
          <div className="paper-list">
            {(filtered.get(FALLBACK_KEY) ?? []).map((paper) => (
              <PaperCard key={paper.slug} paper={paper} />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function PaperCard({ paper }: { paper: PreparedPaper }) {
  const yearVenue = [paper.venue, paper.year ? String(paper.year) : null].filter(Boolean).join(", ");
  return (
    <article className="paper-card">
      <div className="paper-title">{paper.title}</div>
      <div className="paper-authors">{paper.authors}</div>
      {yearVenue ? <div className="paper-journal">{yearVenue}</div> : null}
      {paper.abstract ? <p>{paper.abstract}</p> : null}
      {paper.url ? (
        <a className="paper-link" href={paper.url} target="_blank" rel="noopener noreferrer">
          查看原文
        </a>
      ) : null}
    </article>
  );
}
