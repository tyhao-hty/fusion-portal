import { headers } from "next/headers";

export type ArticleSummary = {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  status?: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  readingTime?: number | null;
  timelineYear?: number | null;
  author?: { id: number; email?: string | null } | null;
  category?: { id: number; slug: string; name: string } | null;
  tags?: { id: number; slug: string; name: string }[];
};

export type ArticleDetail = ArticleSummary & {
  contentHtml: string | null;
  timelineEvents?: { id: number; slug: string; yearLabel: string; yearValue: number | null; title: string }[];
};

export type ArticleListResponse = {
  data: ArticleSummary[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
  };
};

type ListParams = {
  page?: number;
  pageSize?: number;
  q?: string;
  category?: string;
  tags?: string[];
  year?: number;
  yearFrom?: number;
  yearTo?: number;
  sort?: string;
  status?: string;
};

const buildQuery = (params: ListParams) => {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.pageSize) search.set('pageSize', String(params.pageSize));
  if (params.q) search.set('q', params.q);
  if (params.category) search.set('category', params.category);
  if (params.tags && params.tags.length) search.set('tags', params.tags.join(','));
  if (params.year) search.set('year', String(params.year));
  if (params.yearFrom) search.set('yearFrom', String(params.yearFrom));
  if (params.yearTo) search.set('yearTo', String(params.yearTo));
  if (params.sort) search.set('sort', params.sort);
  if (params.status) search.set('status', params.status);
  return search.toString();
};

export async function fetchArticles(params: ListParams = {}): Promise<ArticleListResponse> {
  const query = buildQuery({ status: 'published', ...params });
  let url = `/api/bff/articles?${query}`;
  if (typeof window === 'undefined') {
    const incomingHeaders = await headers();
    const proto = incomingHeaders.get('x-forwarded-proto') ?? 'http';
    const host = incomingHeaders.get('host');
    if (host) {
      url = `${proto}://${host}${url}`;
    }
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`文章列表加载失败：${res.statusText}`);
  }
  return res.json();
}

// Phase 6-3: detail now uses BFF routes.
export async function fetchArticle(slugOrId: string): Promise<ArticleDetail> {
  let url = `/api/bff/articles/${slugOrId}`;
  if (typeof window === 'undefined') {
    const incomingHeaders = await headers();
    const proto = incomingHeaders.get('x-forwarded-proto') ?? 'http';
    const host = incomingHeaders.get('host');
    if (host) {
      url = `${proto}://${host}${url}`;
    }
  }
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status === 404) {
    throw new Error('NOT_FOUND');
  }
  if (!res.ok) {
    throw new Error(`文章加载失败：${res.statusText}`);
  }
  return res.json();
}
