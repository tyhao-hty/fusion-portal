"use client";

import { useEffect, useMemo, useRef } from "react";
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
    total: number;
    totalPages: number;
    order: "asc" | "desc";
    hasNext: boolean;
  };
};

const PAGE_SIZE = 8;

const createKey = (index: number, previousPageData: TimelineResponse | null) => {
  if (previousPageData && !previousPageData.meta.hasNext) {
    return null;
  }
  const page = index + 1;
  return `/api/timeline?page=${page}&limit=${PAGE_SIZE}&order=desc`;
};

const fetcher = (url: string) => apiRequest(url) as Promise<TimelineResponse>;

export function TimelineFeed() {
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
          if (entry.isIntersecting) {
            setSize((current) => current + 1);
          }
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNext, isLoadingMore, setSize, size]);

  const loadMore = () => setSize(size + 1);

  if (error) {
    return (
      <div className="timeline-empty">
        <p>时间线数据加载失败：{error.message}</p>
        <button type="button" className="load-more-button" onClick={() => mutate()}>
          重试
        </button>
      </div>
    );
  }

  if (isLoadingInitial) {
    return <p className="timeline-status">时间线加载中...</p>;
  }

  if (isEmpty) {
    return <div className="timeline-empty">暂时无法加载发展历程，请稍后重试。</div>;
  }

  return (
    <>
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
