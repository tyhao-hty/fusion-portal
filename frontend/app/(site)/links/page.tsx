import type { Metadata } from "next";
import { buildSiteMetadata } from "@/components/site/metadata";
import type { LinkSection, LinksResponse } from "./types";
import { LinksDirectory } from "./LinksDirectory";

export const metadata: Metadata = buildSiteMetadata({
  title: "资源导航",
  description: "精选全球核聚变组织、研究机构、商业企业与教育资源，快速获取权威链接。",
  path: "/links",
});

async function fetchLinks(): Promise<LinksResponse> {
  const response = await fetch("/api/bff/links", { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`拉取链接数据失败：HTTP ${response.status}`);
  }

  const payload = (await response.json()) as LinksResponse;
  return payload;
}

export default async function LinksPage() {
  let sections: LinkSection[] = [];
  let meta: LinksResponse["meta"] | undefined;
  let error: string | null = null;

  try {
    const payload = await fetchLinks();
    sections = payload.data;
    meta = payload.meta;
  } catch (err) {
    error = err instanceof Error ? err.message : "未知错误";
  }

  return (
    <div className="content-page">
      <a href="/" className="back-button">
        ← 返回首页
      </a>

      <h1>核聚变资源导航</h1>
      <p>
        本页汇总核聚变领域的重要网站、研究机构、商业公司、期刊媒体与学习资源，帮助你快速找到可信的资讯来源。
        资源数量较多，可通过搜索与分页逐步浏览。
      </p>

      <LinksDirectory sections={sections} initialMeta={meta} initialError={error} />

      <section>
        <h2>使用建议</h2>
        <div className="company-grid">
          <div className="company-card">
            <div className="company-name">📚 学习路径</div>
            <p>从教育资源与权威期刊入手，逐步关注大型实验装置、行业报告与商业新闻，构建体系化认知。</p>
          </div>
          <div className="company-card">
            <div className="company-name">🔄 定期更新</div>
            <p>聚变进展日新月异，建议订阅新闻媒体与专业协会动态，保持信息更新。</p>
          </div>
          <div className="company-card">
            <div className="company-name">🌐 多语言视角</div>
            <p>结合中英文资源进行交叉验证，获取更全面的视角，并关注国际合作项目。</p>
          </div>
          <div className="company-card">
            <div className="company-name">🤝 拓展网络</div>
            <p>积极参与会议、社群与论坛，建立科研、产业与投资等多方联系。</p>
          </div>
        </div>
      </section>

      <section>
        <h2>免责声明</h2>
        <p>以上链接仅为学习参考之用，本站不对外部网站的内容、准确性或可用性负责。使用前请自行甄别，如发现失效链接欢迎反馈。</p>
        <p>最后更新时间：2025 年 8 月。</p>
      </section>
    </div>
  );
}
