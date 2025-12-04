import { buildSiteMetadata } from "@/components/site/metadata";

export const metadata = buildSiteMetadata({
  title: "核聚变科普知识",
  path: "/science",
  description: "用通俗语言介绍核聚变基本概念、能量来源与实验装置，帮助快速入门。",
});

export default function SciencePage() {
  return (
    <div className="content-page">
      <a href="/" className="back-button">
        ← 返回首页
      </a>

      <h1>核聚变科普知识</h1>
      <p>
        核聚变是恒星持续发光的根本原因，也是人类追寻的长远能源解决方案。本页从能量来源、实验装置与安全优势等角度，帮助初学者快速了解聚变的核心概念。
      </p>

      <h2>什么是核聚变？</h2>
      <p>
        当两个轻原子核以足够高的速度靠近时，强相互作用会战胜库仑排斥，将它们结合成更重的原子核，并释放出巨大的能量。太阳的能量正是源于氢核聚变。
      </p>

      <h2>实现聚变需要哪些条件？</h2>
      <ul>
        <li>
          <strong>高温：</strong>需要上亿摄氏度的等离子体，以克服库仑排斥。
        </li>
        <li>
          <strong>高密度：</strong>粒子密度越高，碰撞概率越大。
        </li>
        <li>
          <strong>足够的约束时间：</strong>需要让高温等离子体长时间被束缚在有限空间内。
        </li>
        <li>
          <strong>劳森判据：</strong>温度、密度与约束时间的乘积必须达到临界值。
        </li>
      </ul>

      <h2>聚变装置有哪些类型？</h2>
      <p>
        最常见的路线是托卡马克与仿星器等磁约束装置，通过强磁场束缚等离子体；另一类是惯性约束装置，使用激光或粒子束瞬间压缩燃料球。不同路线正在协同发展。
      </p>

      <h2>聚变的优势与挑战</h2>
      <ul>
        <li>
          <strong>优势：</strong>燃料储量丰富、碳排放极低、具备内在安全性、放射性废物寿命较短。
        </li>
        <li>
          <strong>挑战：</strong>材料耐受高热流、高中子辐照；装置工程复杂；商业化需要经济可行的运行模式。
        </li>
      </ul>

      <h2>进一步学习</h2>
      <div className="links-grid">
        <a
          href="https://energy.gov/science/fes/what-is-fusion-energy"
          className="link-card"
          target="_blank"
          rel="noreferrer"
        >
          <div className="link-title">DOE Fusion Basics</div>
          <div className="link-description">美国能源部的聚变科普页面，从零开始介绍基础概念。</div>
        </a>
        <a href="https://www.iter.org/sci/whatisfusion" className="link-card" target="_blank" rel="noreferrer">
          <div className="link-title">ITER - What is Fusion?</div>
          <div className="link-description">ITER 官方科普，配有图解与常见问答。</div>
        </a>
        <a href="https://www.youtube.com/watch?v=mZsaaturR6E" className="link-card" target="_blank" rel="noreferrer">
          <div className="link-title">Kurzgesagt: Fusion Power Explained</div>
          <div className="link-description">动画讲解聚变能原理及工程要点。</div>
        </a>
        <a href="https://www.plasma-wiki.org/" className="link-card" target="_blank" rel="noreferrer">
          <div className="link-title">Plasma-Wiki</div>
          <div className="link-description">等离子体与聚变知识维基，收录大量入门资料。</div>
        </a>
      </div>
    </div>
  );
}
