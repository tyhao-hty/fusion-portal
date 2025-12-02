import Link from "next/link";
import { fetchArticles } from "@/lib/articles";

type SearchParams = {
  q?: string;
  page?: string;
  sort?: string;
  status?: string;
};

export const dynamic = "force-dynamic";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = Number.parseInt(searchParams.page || "1", 10) || 1;
  const q = searchParams.q?.trim() || "";
  const sort = searchParams.sort || "published_desc";
  const status = searchParams.status?.trim() || "published";

  let articles = [];
  let meta = {
    total: 0,
    page,
    pageSize: 0,
    totalPages: 1,
    hasNext: false,
  };
  let error: string | null = null;

  try {
    const resp = await fetchArticles({
      page,
      q,
      sort,
      status,
    });
    articles = resp.data;
    meta = resp.meta;
  } catch (err: any) {
    error = err?.message || "文章加载失败";
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">文章</h1>
          <p className="text-gray-600">
            已发布文章列表（共 {meta.total} 篇）
          </p>
        </div>
        <form className="flex gap-2" method="get">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="搜索标题、摘要或正文"
            className="w-64 rounded border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            搜索
          </button>
        </form>
      </div>

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
          加载失败：{error}
        </div>
      ) : articles.length === 0 ? (
        <p className="text-gray-600">暂无符合条件的文章。</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li
              key={article.id}
              className="rounded border bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h2>
                <span className="text-xs text-gray-500">
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString()
                    : ""}
                </span>
              </div>
              <p className="mt-1 text-gray-700">
                {article.excerpt ??
                  (article.content && article.content.length > 180
                    ? `${article.content.slice(0, 180)}...`
                    : article.content)}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                {article.category && (
                  <span className="rounded bg-gray-100 px-2 py-1">
                    分类：{article.category.name}
                  </span>
                )}
                {article.tags?.length ? (
                  <span className="flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded bg-gray-100 px-2 py-1"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </span>
                ) : null}
                {article.readingTime ? (
                  <span>{article.readingTime} 分钟阅读</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between text-sm text-gray-700">
        <div>
          第 {meta.page} / {meta.totalPages} 页
        </div>
        <div className="flex gap-2">
          {meta.page > 1 && (
            <Link
              className="rounded border px-3 py-2 hover:bg-gray-50"
              href={{
                pathname: "/articles",
                query: { ...searchParams, page: meta.page - 1 || 1 },
              }}
            >
              上一页
            </Link>
          )}
          {meta.hasNext && (
            <Link
              className="rounded border px-3 py-2 hover:bg-gray-50"
              href={{
                pathname: "/articles",
                query: { ...searchParams, page: meta.page + 1 },
              }}
            >
              下一页
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
