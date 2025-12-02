"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/components/UserContext";

type NavItem = {
  href: string;
  label: string;
  isExternal?: boolean;
  variant?: "primary" | "legacy";
};

const NAV_ITEMS: NavItem[] = [
  { href: "/site", label: "首页" },
  { href: "/site/history", label: "发展历史" },
  { href: "/site/papers", label: "论文汇总" },
  { href: "/site/links", label: "相关链接" },
  { href: "/science.html", label: "科普知识", isExternal: true, variant: "legacy" },
  { href: "/theory.html", label: "理论知识", isExternal: true, variant: "legacy" },
  { href: "/technology.html", label: "技术路线", isExternal: true, variant: "legacy" },
  { href: "/business.html", label: "商业尝试", isExternal: true, variant: "legacy" },
];

const MOBILE_MEDIA_QUERY = "(max-width: 991px)";

export function SiteHeader() {
  const { user, setUser } = useUser();
  const [pathname, setPathname] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const syncPath = () => setPathname(window.location.pathname);
    syncPath();
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
      if (!event.matches) {
        setIsNavOpen(false);
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsNavOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]');
    const handleClick = (event: MouseEvent) => {
      const anchor = event.currentTarget as HTMLAnchorElement | null;
      if (!anchor) return;
      const targetId = anchor.getAttribute("href");
      if (!targetId) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    anchors.forEach((anchor) => {
      anchor.addEventListener("click", handleClick);
    });

    return () => {
      anchors.forEach((anchor) => {
        anchor.removeEventListener("click", handleClick);
      });
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setUser(null);
    window.location.href = "/login";
  }

  const handleNavItemClick = (href?: string) => {
    if (isMobile) {
      setIsNavOpen(false);
    }
    if (href?.startsWith("/")) {
      setPathname(href);
    }
  };

  const navMenuClass = useMemo(() => {
    const base = "nav-menu";
    return isNavOpen ? `${base} nav-menu--open` : base;
  }, [isNavOpen]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/site") {
      return pathname === "/site";
    }
    return pathname.startsWith(href);
  };
  const buildClassName = (item: NavItem) => {
    const classes = ["nav-link"];
    if (item.variant === "legacy") {
      classes.push("nav-link--legacy");
    }
    if (isActive(item.href)) {
      classes.push("nav-link--active");
    }
    if (item.isExternal) {
      classes.push("nav-link--external");
    }
    return classes.join(" ");
  };

  return (
    <header className={`header${isScrolled ? " header--scrolled" : ""}`} role="banner">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="nav-container" data-nav-container>
        <Link href="/site" className="logo">
          核聚变门户
        </Link>
        <button
          type="button"
          className="nav-toggle"
          data-nav-toggle
          aria-label="切换主导航"
          aria-controls="primary-navigation"
          aria-expanded={isNavOpen}
          onClick={() => setIsNavOpen((open) => !open)}
        >
          <span className="nav-toggle__bar" aria-hidden="true" />
          <span className="nav-toggle__bar" aria-hidden="true" />
          <span className="nav-toggle__bar" aria-hidden="true" />
        </button>
        <nav className="primary-nav" aria-label="主导航">
          <ul
            className={navMenuClass}
            id="primary-navigation"
            data-nav-menu
            aria-hidden={isMobile ? !isNavOpen : false}
          >
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {item.isExternal ? (
                  <a
                    href={item.href}
                    onClick={() => handleNavItemClick(item.href)}
                    className={buildClassName(item)}
                    rel="noreferrer"
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => handleNavItemClick(item.href)}
                    className={buildClassName(item)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            {!user ? (
              <>
                <li>
                  <Link
                    href="/login"
                    onClick={() => handleNavItemClick("/login")}
                    className="nav-link nav-link--auth"
                  >
                    登录
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    onClick={() => handleNavItemClick("/register")}
                    className="nav-link nav-link--auth"
                  >
                    注册
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/new" onClick={() => handleNavItemClick("/new")} className="nav-link nav-link--auth">
                    写文章
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin"
                    onClick={() => handleNavItemClick("/admin")}
                    className="nav-link nav-link--auth"
                  >
                    管理
                  </Link>
                </li>
                <li>
                  <button type="button" className="nav-logout" onClick={handleLogout}>
                    退出
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
