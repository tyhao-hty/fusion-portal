"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/api";
import { useUser } from "@/components/UserContext";

type Article = {
  id: number;
  title: string;
  content: string;
};

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState("");
  const { user } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    apiRequest("/articles", "GET", undefined, token)
      .then((data) => setArticles(data))
      .catch((error) => setMessage("加载失败: " + error.message));
  }, [user]);

  async function handleDelete(id: number) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("请先登录");
      window.location.href = "/login";
      return;
    }

    try {
      await apiRequest(`/articles/${id}`, "DELETE", undefined, token);
      setArticles((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      setMessage("删除失败: " + error.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">文章管理</h1>
      {message && <p className="text-red-600">{message}</p>}
      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.id} className="p-4 border rounded">
            <h2 className="text-xl font-semibold">{article.title}</h2>
            <p className="text-gray-600">
              {article.content.length > 100
                ? `${article.content.slice(0, 100)}...`
                : article.content}
            </p>
            <button
              onClick={() => handleDelete(article.id)}
              className="text-red-600 hover:underline mt-2"
              type="button"
            >
              删除
            </button>
          </li>
        ))}
      </ul>
      {!articles.length && !message && (
        <p className="text-gray-500">暂无文章，前往“写文章”发布一篇吧。</p>
      )}
    </div>
  );
}
