import type { Metadata } from "next";
import { buildSiteMetadata } from "@/components/site/metadata";
import { PapersCatalog } from "./PapersCatalog";
import type { Paper, PapersResponse } from "./types";

export const metadata: Metadata = buildSiteMetadata({
  title: "论文汇总",
  description: "搜集核聚变领域的经典论文与前沿研究，支持关键词筛选与主题浏览。",
  path: "/site/papers",
});

async function fetchPapers(): Promise<Paper[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api/papers?limit=100`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`拉取论文数据失败：HTTP ${response.status}`);
  }

  const payload = (await response.json()) as PapersResponse;
  return payload.data;
}

export default async function PapersPage() {
  let papers: Paper[] = [];
  let error: string | null = null;

  try {
    papers = await fetchPapers();
  } catch (err) {
    error = err instanceof Error ? err.message : "未知错误";
  }

  return (
    <div className="content-page">
      <a href="/site" className="back-button">
        ← 返回首页
      </a>

      <h1>核聚变论文汇总</h1>
      <p>
        本页面集中整理核聚变领域具有代表性的论文、综述与研究报告。所有数据来自后端
        API，并支持按主题分类浏览或通过搜索快速定位目标文献。
      </p>

      {error ? (
        <p className="paper-status">论文数据加载失败：{error}</p>
      ) : papers.length ? (
        <PapersCatalog papers={papers} />
      ) : (
        <p className="paper-status">暂时没有可展示的论文，请稍后再试。</p>
      )}

      <section>
        <h2>常用论文与数据资源</h2>
        <div className="links-grid">
          <a href="https://ui.adsabs.harvard.edu/" className="link-card" target="_blank" rel="noopener noreferrer">
            <div className="link-title">NASA ADS</div>
            <div className="link-description">天体物理与等离子体论文数据库，支持聚变主题检索。</div>
          </a>
          <a
            href="https://arxiv.org/list/physics.plasm-ph/recent"
            className="link-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="link-title">arXiv Plasma Physics</div>
            <div className="link-description">等离子体物理与聚变领域预印本更新最快的平台。</div>
          </a>
          <a href="https://www.iaea.org/publications" className="link-card" target="_blank" rel="noopener noreferrer">
            <div className="link-title">IAEA Publications</div>
            <div className="link-description">国际原子能机构出版物，涵盖 ITER、聚变会议论文与技术报告。</div>
          </a>
          <a
            href="https://www.sciencedirect.com/journal/nuclear-fusion"
            className="link-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="link-title">Nuclear Fusion Journal</div>
            <div className="link-description">核聚变领域权威期刊，获取最新同行评审论文。</div>
          </a>
        </div>
      </section>
    </div>
  );
}
