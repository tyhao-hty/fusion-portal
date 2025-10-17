"use client";

import { useUser } from "./UserContext";

export function Navbar() {
  const { user, setUser } = useUser();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <a href="/" className="font-semibold text-xl">
          Fusion Portal
        </a>
        <div className="space-x-4 flex items-center">
          <a href="/index.html" className="text-gray-700 hover:text-blue-600">
            旧版首页
          </a>
          {!user ? (
            <>
              <a href="/login" className="text-gray-700 hover:text-blue-600">
                登录
              </a>
              <a href="/register" className="text-gray-700 hover:text-blue-600">
                注册
              </a>
            </>
          ) : (
            <>
              <span className="text-gray-700">欢迎，{user.email}</span>
              <a href="/new" className="text-gray-700 hover:text-blue-600">
                写文章
              </a>
              <a href="/admin" className="text-gray-700 hover:text-blue-600">
                管理
              </a>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:underline"
                type="button"
              >
                退出
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
