import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchArticle } from "@/lib/articles";

type PageParams = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export default async function ArticleDetailPage({ params }: PageParams) {
  const { slug } = await params;
  let article;
  try {
    article = await fetchArticle(slug);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-white">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        <div className="space-y-2">
          <Link href="/articles" className="text-sm text-blue-600 hover:underline">
            ← 返回文章列表
          </Link>
          <h1 className="text-4xl font-bold">{article.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            <span>
              {article.publishedAt
                ? `发布于 ${new Date(article.publishedAt).toLocaleDateString()}`
                : "未发布"}
            </span>
            {article.readingTime ? <span>预计 {article.readingTime} 分钟阅读</span> : null}
            {article.author?.email ? <span>作者：{article.author.email}</span> : null}
            {article.category ? <span>分类：{article.category.name}</span> : null}
            {article.tags?.length ? (
              <span className="flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span key={tag.id} className="rounded bg-gray-100 px-2 py-1">
                    #{tag.name}
                  </span>
                ))}
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-md shadow-slate-200 backdrop-blur-sm">
          {article.coverImageUrl ? (
        <div className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-100">
          <Image
            src={article.coverImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
          ) : null}

          <article className="prose-article mt-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </article>
        </div>

        {article.timelineEvents?.length ? (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 shadow-sm">
            <h2 className="text-lg font-semibold">关联时间线</h2>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              {article.timelineEvents.map((item) => (
                <li key={item.id}>
                  {item.yearLabel ?? item.yearValue ?? ""} · {item.title}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
