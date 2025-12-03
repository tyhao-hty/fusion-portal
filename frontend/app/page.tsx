import type { Metadata } from "next";
import Link from "next/link";
import { SiteFrame } from "@/components/layouts/SiteFrame";
import { buildSiteMetadata } from "@/components/site/metadata";

export const metadata: Metadata = buildSiteMetadata({
  title: "首页",
  path: "/",
  description: "探索核聚变发展历程、理论知识、技术路线与商业动态的门户首页。",
});

const MODULES = [
  {
    title: "🕰️ 发展历史",
    description: "从 1920 年代的理论构想到现代大型实验装置，梳理核聚变研究的重要里程碑。",
    href: "/history",
  },
  {
    title: "🔬 科普知识",
    description: "用通俗语言解释聚变原理、反应条件与能量机制，快速建立基础认知。",
    href: "/science.html",
  },
  {
    title: "📚 理论知识",
    description: "深入等离子体物理、磁约束与惯性约束理论，面向进阶学习者与研究者。",
    href: "/theory.html",
  },
  {
    title: "📄 论文汇总",
    description: "精选聚变领域的经典论文与最新研究，提供搜索与分类，快速定位重要成果。",
    href: "/papers.html",
  },
  {
    title: "⚙️ 技术路线",
    description: "对比托卡马克、仿星器、惯性约束等技术路径的优势、挑战与发展趋势。",
    href: "/technology.html",
  },
  {
    title: "💼 商业尝试",
    description: "跟踪全球聚变创业公司、投融资动态与产业化进程，解读商业化路线。",
    href: "/business.html",
  },
  {
    title: "🔗 相关链接",
    description: "收录权威机构、教育资源、行业会议与社群，为持续学习提供导航。",
    href: "/links.html",
  },
];

export default function HomePage() {
  return (
    <SiteFrame>
      <section className="hero">
        <h1>核聚变门户</h1>
        <p>探索人类能源的未来，了解核聚变从理论到实践的完整历程。</p>
        <a href="#modules" className="cta-button">
          开始探索
        </a>
      </section>

      <section id="modules" className="modules-grid">
        {MODULES.map((module) => (
          <div key={module.title} className="module-card">
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            {module.href.startsWith("/") && !module.href.endsWith(".html") ? (
              <Link href={module.href} className="module-link">
                立即查看
              </Link>
            ) : (
              <a href={module.href} className="module-link">
                立即查看
              </a>
            )}
          </div>
        ))}
      </section>
    </SiteFrame>
  );
}
