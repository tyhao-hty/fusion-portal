"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import { apiRequest } from "@/utils/api";

type TimelineItem = {
  id: number;
  slug: string;
  yearLabel: string;
  yearValue: number | null;
  title: string;
  description: string;
  sortOrder: number;
};

type TimelineResponse = {
  data: TimelineItem[];
  meta: {
    page: number;
    limit: number;
    pageSize?: number;
    total: number;
    totalPages: number;
    order: "asc" | "desc";
    hasNext: boolean;
    hasMore?: boolean;
  };
};

const PAGE_SIZE = 8;
const FILTER_STORAGE_KEY = "fusion-site:timeline-filters";
const LOAD_THROTTLE_MS = 400;

const fetcher = (url: string) => apiRequest(url) as Promise<TimelineResponse>;

export function TimelineFeed() {
  const [search, setSearch] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    yearFrom: "",
    yearTo: "",
  });
  const hasHydratedFilters = useRef(false);
  const lastLoadRef = useRef(0);

  const createKey = (index: number, previousPageData: TimelineResponse | null) => {
    if (previousPageData && !previousPageData.meta.hasNext && !previousPageData.meta.hasMore) {
      return null;
    }
    const page = index + 1;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
      order: "desc",
    });
    if (appliedFilters.search.trim()) {
      params.set("q", appliedFilters.search.trim());
    }
    const fromNum = appliedFilters.yearFrom.trim();
    const toNum = appliedFilters.yearTo.trim();
    if (fromNum) params.set("yearFrom", fromNum);
    if (toNum) params.set("yearTo", toNum);
    return `/api/timeline?${params.toString()}`;
  };

  const {
    data,
    error,
    mutate,
    size,
    setSize,
    isValidating,
  } = useSWRInfinite<TimelineResponse>(createKey, fetcher, {
    revalidateFirstPage: false,
  });

  const timelineItems = useMemo(
    () => (data ? data.flatMap((page) => page.data) : []),
    [data],
  );

  const total = data?.[0]?.meta.total ?? 0;
  const hasNext = data?.[data.length - 1]?.meta.hasNext ?? false;
  const isLoadingInitial = !data && !error;
  const isLoadingMore = isValidating && Boolean(data?.length);
  const isEmpty = total === 0;

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasNext || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoadingMore && hasNext) {
            const now = Date.now();
            if (now - lastLoadRef.current < LOAD_THROTTLE_MS) {
              return;
            }
            lastLoadRef.current = now;
            setSize((current) => current + 1);
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNext, isLoadingMore, setSize, size]);

  const loadMore = () => {
    if (!hasNext || isLoadingMore) return;
    const now = Date.now();
    if (now - lastLoadRef.current < LOAD_THROTTLE_MS) return;
    lastLoadRef.current = now;
    setSize(size + 1);
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({
      search,
      yearFrom: yearFrom.trim(),
      yearTo: yearTo.trim(),
    });
    setSize(1);
  };

  const clearFilters = () => {
    setSearch("");
    setYearFrom("");
    setYearTo("");
    setAppliedFilters({
      search: "",
      yearFrom: "",
      yearTo: "",
    });
    setSize(1);
  };

  useEffect(() => {
    if (hasHydratedFilters.current) {
      return;
    }
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(FILTER_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { search?: string; yearFrom?: string; yearTo?: string };
      setSearch(parsed.search ?? "");
      setYearFrom(parsed.yearFrom ?? "");
      setYearTo(parsed.yearTo ?? "");
      setAppliedFilters({
        search: parsed.search ?? "",
        yearFrom: parsed.yearFrom ?? "",
        yearTo: parsed.yearTo ?? "",
      });
    } catch (hydrateError) {
      console.warn("[TimelineFeed] Failed to load saved filters", hydrateError);
    } finally {
      hasHydratedFilters.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedFilters.current) return;
    if (typeof window === "undefined") return;
    const payload = JSON.stringify(appliedFilters);
    localStorage.setItem(FILTER_STORAGE_KEY, payload);
  }, [appliedFilters]);

  const filtersAreActive =
    appliedFilters.search.trim() || appliedFilters.yearFrom.trim() || appliedFilters.yearTo.trim();
  const activeFilterLabel = filtersAreActive
    ? [
        appliedFilters.search ? `关键词：“${appliedFilters.search}”` : null,
        appliedFilters.yearFrom ? `年份 ≥ ${appliedFilters.yearFrom}` : null,
        appliedFilters.yearTo ? `年份 ≤ ${appliedFilters.yearTo}` : null,
      ]
        .filter(Boolean)
        .join("，")
    : "未启用筛选";

  if (error) {
    return (
      <div className="timeline-empty">
        <p>
          时间线数据加载失败：{error.message}
          {filtersAreActive ? `（当前筛选：${activeFilterLabel}）` : ""}
        </p>
        <button type="button" className="load-more-button" onClick={() => mutate()}>
          重试
        </button>
      </div>
    );
  }

  if (isLoadingInitial) {
    return (
      <div className="timeline-skeleton">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-line--wide" />
          </div>
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return <div className="timeline-empty">暂时无法加载发展历程，请稍后重试。</div>;
  }

  return (
    <>
      <form className="timeline-filters" onSubmit={applyFilters}>
        <div className="filter-group">
          <label htmlFor="timeline-search">关键词</label>
          <input
            id="timeline-search"
            type="search"
            inputMode="search"
            placeholder="搜索事件标题或描述…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="timeline-year-from">起始年份</label>
          <input
            id="timeline-year-from"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="例如 1950"
            value={yearFrom}
            onChange={(event) => setYearFrom(event.target.value)}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="timeline-year-to">结束年份</label>
          <input
            id="timeline-year-to"
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="例如 2030"
            value={yearTo}
            onChange={(event) => setYearTo(event.target.value)}
          />
        </div>
        <div className="filter-actions">
          <button type="submit" className="load-more-button">
            应用筛选
          </button>
          <button
            type="button"
            className="load-more-button load-more-button--ghost"
            onClick={clearFilters}
            disabled={!filtersAreActive}
          >
            重置
          </button>
        </div>
        <p className="timeline-status" aria-live="polite">
          当前筛选：{activeFilterLabel}
        </p>
      </form>

      <div className="timeline" data-timeline-container>
        {timelineItems.map((item) => (
          <article key={item.slug} className="timeline-item">
            <div className="timeline-year">{item.yearLabel}</div>
            <div className="timeline-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="timeline-controls">
        <button
          type="button"
          className="load-more-button"
          onClick={loadMore}
          disabled={!hasNext || isLoadingMore}
          aria-busy={isLoadingMore}
          aria-disabled={!hasNext}
        >
          {hasNext ? (isLoadingMore ? "加载中..." : "加载更多里程碑") : "已经到底啦"}
        </button>
        <p className="timeline-status" aria-live="polite">
          已展示 {timelineItems.length} / {total} 个里程碑
        </p>
      </div>
      <div ref={sentinelRef} className="timeline-sentinel" aria-hidden="true" />
    </>
  );
}
