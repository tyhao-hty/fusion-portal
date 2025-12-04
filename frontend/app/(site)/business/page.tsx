import { buildSiteMetadata } from "@/components/site/metadata";

export const metadata = buildSiteMetadata({
  title: "核聚变商业尝试",
  path: "/business",
  description: "了解全球核聚变商业化公司、投融资动向与产业生态，洞察未来能源市场机会。",
});

export default function BusinessPage() {
  return (
    <div className="content-page">
      <a href="/" className="back-button">
        ← 返回首页
      </a>

      <h1>核聚变商业尝试</h1>
      <p>
        随着高温超导、先进制造与人工智能等技术的加持，核聚变商业化从“遥远梦想”迈向“工程落地”。全球多家创业公司与传统能源巨头投入这场竞赛，力图率先建设经济可行的聚变电站。
      </p>

      <h2>全球代表性企业</h2>
      <div className="company-grid">
        <div className="company-card">
          <div className="company-name">Commonwealth Fusion Systems</div>
          <p>起源于麻省理工学院，聚焦高温超导托卡马克技术，SPARC 项目计划在本十年实现净能量增益。</p>
        </div>
        <div className="company-card">
          <div className="company-name">TAE Technologies</div>
          <p>美国老牌聚变公司，主攻场反转位形（FRC），Norman 装置已完成多轮升级。</p>
        </div>
        <div className="company-card">
          <div className="company-name">Helion Energy</div>
          <p>以脉冲聚变为核心，采用金属燃料与能量回收方案，目标是实现小型化电源模块。</p>
        </div>
        <div className="company-card">
          <div className="company-name">Tokamak Energy</div>
          <p>英国企业，开发高场球形托卡马克与高温超导磁体，计划在 2030 年代提供商用示范。</p>
        </div>
        <div className="company-card">
          <div className="company-name">Type One Energy</div>
          <p>专注仿星器商业化，由威斯康星大学研究团队创办，致力于快速迭代模块化原型。</p>
        </div>
        <div className="company-card">
          <div className="company-name">能源奇点（Energy Singularity）</div>
          <p>中国聚变创业公司，聚焦超导托卡马克方案，建设紧凑型实验装置验证设计。</p>
        </div>
      </div>

      <h2>市场与技术趋势</h2>
      <ul>
        <li>
          <strong>高温超导磁体：</strong>更高的磁场强度缩小装置尺寸，降低工程复杂度。
        </li>
        <li>
          <strong>模块化工程：</strong>通过快速迭代与工厂化制造，加速原型堆部署。
        </li>
        <li>
          <strong>多元燃料路线：</strong>从传统的 D-T 反应延伸至 D-³He、p-¹¹B 等更清洁的燃料组合。
        </li>
        <li>
          <strong>资本跨界合作：</strong>能源巨头、科技公司与主权基金共同参与，构建新的产业生态。
        </li>
      </ul>

      <h2>投融资与政策动态</h2>
      <div className="links-grid">
        <a href="https://www.fusionindustryassociation.org/" className="link-card" target="_blank" rel="noreferrer">
          <div className="link-title">Fusion Industry Association</div>
          <div className="link-description">聚变产业协会发布年度投融资报告与政策更新。</div>
        </a>
        <a href="https://www.fusionworld.org/news/" className="link-card" target="_blank" rel="noreferrer">
          <div className="link-title">Fusion World News</div>
          <div className="link-description">聚变行业新闻网站，追踪企业合作与项目进展。</div>
        </a>
        <a href="https://www.iea.org/reports/nuclear-fusion" className="link-card" target="_blank" rel="noreferrer">
          <div className="link-title">IEA Fusion Report</div>
          <div className="link-description">国际能源署聚变专项报告，分析市场潜力与政策建议。</div>
        </a>
        <a
          href="https://www.mckinsey.com/industries/electric-power-and-natural-gas/our-insights/the-promise-of-fusion"
          className="link-card"
          target="_blank"
          rel="noreferrer"
        >
          <div className="link-title">McKinsey on Fusion</div>
          <div className="link-description">麦肯锡聚变能源行业洞察，评估商业化路径与挑战。</div>
        </a>
      </div>
    </div>
  );
}
