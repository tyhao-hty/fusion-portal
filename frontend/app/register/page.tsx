"use client";

import { useState } from "react";
import { apiRequest } from "@/utils/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const res = await apiRequest("/auth/register", "POST", { email, password });
      localStorage.setItem("token", res.token);
      setMessage("注册成功，已自动登录");
    } catch (error: any) {
      setMessage("注册失败: " + error.message);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">注册</h1>
      <form onSubmit={handleRegister} className="space-y-2">
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
          注册
        </button>
      </form>
      <p>{message}</p>
    </div>
  );
}
