import "./globals.css";
import "./(site)/styles-legacy.css";
import React from "react";
import { UserProvider } from "../components/UserContext";


export const metadata = {
  title: {
    default: '核聚变门户',
    template: '%s - 核聚变门户',
  },
  description: '核聚变门户：汇聚发展历程、理论知识、技术路线与商业动向的中文知识平台。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="bg-gray-50 text-gray-900">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
