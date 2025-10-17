"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/api";

type Article = {
  id: number;
  title: string;
  content: string;
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
    apiRequest("/articles")
      .then((data) => {
        setArticles(data);
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
            <h2 className="text-2xl font-semibold">{article.title}</h2>
            <p className="text-gray-700 whitespace-pre-line">{article.content}</p>
            <p className="text-sm text-gray-500">
              作者: {article.author?.email ?? "未知"} •{" "}
              {new Date(article.createdAt).toLocaleString()}
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
