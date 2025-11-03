"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const FOOTER_LINKS = [
  { href: "/site/history", label: "发展历史" },
  { href: "/science.html", label: "科普知识", external: true },
  { href: "/theory.html", label: "理论知识", external: true },
  { href: "/papers.html", label: "论文汇总", external: true },
  { href: "/technology.html", label: "技术路线", external: true },
  { href: "/business.html", label: "商业尝试", external: true },
  { href: "/links.html", label: "相关链接", external: true },
];

export function SiteFooter() {
  const [year, setYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__branding">
          <Link href="/site" className="footer__logo">
            核聚变门户
          </Link>
          <p className="footer__tagline">探索人类能源的未来，连接核聚变的过去、现在与明天。</p>
        </div>
        <nav className="footer__nav" aria-label="页脚导航">
          <ul className="footer__links">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                {link.external ? (
                  <a href={link.href}>{link.label}</a>
                ) : (
                  <Link href={link.href}>{link.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="footer__note">
        © <span>{year}</span> 核聚变门户. 保留所有权利。
      </p>
    </footer>
  );
}
