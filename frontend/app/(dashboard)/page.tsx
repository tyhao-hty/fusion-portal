"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/api";

type Article = {
  id: number;
  title: string;
  content: string;
  excerpt?: string | null;
  status?: string;
  publishedAt?: string | null;
  createdAt: string;
  author?: {
    email?: string;
  };
};

export default function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiRequest("/articles?status=published")
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.data;
        setArticles(Array.isArray(list) ? list : []);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold">核聚变门户文章列表</h1>
      {isLoading && <p>加载中...</p>}
      {error && <p className="text-red-500">加载错误: {error}</p>}
      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.id} className="p-4 border rounded bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">{article.title}</h2>
              <span className="text-xs rounded px-2 py-1 bg-gray-100 text-gray-700">
                {article.status ?? "unknown"}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-line">
              {article.excerpt ??
                (article.content.length > 160
                  ? `${article.content.slice(0, 160)}...`
                  : article.content)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              作者: {article.author?.email ?? "未知"} •{" "}
              {article.publishedAt
                ? `发布于 ${new Date(article.publishedAt).toLocaleString()}`
                : `创建于 ${new Date(article.createdAt).toLocaleString()}`}
            </p>
          </li>
        ))}
      </ul>
      {!isLoading && articles.length === 0 && !error && (
        <p className="text-gray-600">暂无文章，欢迎登录后发布第一篇内容。</p>
      )}
    </div>
  );
}
