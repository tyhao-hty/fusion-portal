"use client";

import { useState } from "react";
import { apiRequest } from "@/utils/api";

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("请先登录");
      return;
    }

    try {
      await apiRequest("/articles", "POST", { title, content }, token);
      setMessage("发布成功");
      setTitle("");
      setContent("");
    } catch (error: any) {
      setMessage("发布失败: " + error.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">发布新文章</h1>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="标题"
          className="border p-2 w-full"
          required
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="内容"
          className="border p-2 w-full h-40"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          提交
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
