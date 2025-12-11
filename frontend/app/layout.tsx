// import "./globals.css";
// 站点样式迁移到各自布局，避免污染 /admin。
import React from "react";
import { headers } from "next/headers";


export const metadata = {
  title: {
    default: '核聚变门户',
    template: '%s - 核聚变门户',
  },
  description: '核聚变门户：汇聚发展历程、理论知识、技术路线与商业动向的中文知识平台。',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();

  const rawPath =
    headerList.get("x-invoke-path") ||
    headerList.get("x-matched-path") ||
    headerList.get("next-url") ||
    "";

  const normalizedPath = rawPath.startsWith("http")
    ? new URL(rawPath).pathname
    : rawPath;

  const isPayloadAdmin = normalizedPath.startsWith("/admin");

  // 对 /admin（Payload Admin）直接交给 (payload) 布局处理，避免双 <html>/<body> 嵌套。
  if (isPayloadAdmin) {
    return children;
  }

  return (
    <html lang="zh">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
