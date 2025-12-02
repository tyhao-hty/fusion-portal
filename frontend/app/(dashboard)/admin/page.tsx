"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/utils/api";
import { useUser } from "@/components/UserContext";

type Article = {
  id: number;
  title: string;
  content: string;
  status?: string;
  publishedAt?: string | null;
  createdAt?: string;
};

export default function AdminPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    apiRequest(`/articles?status=all&page=${page}&pageSize=20`, "GET", undefined, token)
      .then((response) => {
        const list = Array.isArray(response) ? response : response?.data;
        const meta = Array.isArray(response) ? null : response?.meta;
        setArticles(Array.isArray(list) ? list : []);
        if (meta) {
          setHasNext(Boolean(meta.hasNext));
          setTotalPages(meta.totalPages ?? 1);
        } else {
          setHasNext(false);
          setTotalPages(1);
        }
      })
      .catch((error) => setMessage("加载失败: " + error.message));
  }, [user, page]);

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

  async function handleStatusChange(id: number, nextStatus: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("请先登录");
      window.location.href = "/login";
      return;
    }
    try {
      const updated = await apiRequest(`/articles/${id}`, "PUT", { status: nextStatus }, token);
      setArticles((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)));
      setMessage("");
    } catch (error: any) {
      setMessage("更新状态失败: " + error.message);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">文章管理</h1>
      {message && <p className="text-red-600">{message}</p>}
      <ul className="space-y-4">
        {articles.map((article) => (
          <li key={article.id} className="p-4 border rounded">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{article.title}</h2>
              <select
                className="text-xs rounded px-2 py-1 bg-gray-100 text-gray-700 border"
                value={article.status ?? "draft"}
                onChange={(e) => handleStatusChange(article.id, e.target.value)}
              >
                <option value="draft">草稿</option>
                <option value="review">审核中</option>
                <option value="published">已发布</option>
              </select>
            </div>
            <p className="text-gray-600">
              {article.content.length > 100
                ? `${article.content.slice(0, 100)}...`
                : article.content}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {article.publishedAt
                ? `发布于 ${new Date(article.publishedAt).toLocaleString()}`
                : article.createdAt
                  ? `创建于 ${new Date(article.createdAt).toLocaleString()}`
                  : null}
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
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          第 {page} / {totalPages} 页
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <button
              type="button"
              className="rounded border px-3 py-1 hover:bg-gray-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              上一页
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              className="rounded border px-3 py-1 hover:bg-gray-50"
              onClick={() => setPage((p) => p + 1)}
            >
              下一页
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
