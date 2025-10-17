"use client";

import { useState } from "react";
import { apiRequest } from "@/utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const res = await apiRequest("/auth/login", "POST", { email, password });
      localStorage.setItem("token", res.token);
      setMessage("登录成功");
    } catch (error: any) {
      setMessage("登录失败: " + error.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">登录</h1>
      <form onSubmit={handleLogin} className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="邮箱"
          className="border p-2 w-full"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="密码"
          className="border p-2 w-full"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          登录
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
