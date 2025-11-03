import type { Metadata } from "next";
import { buildSiteMetadata } from "@/components/site/metadata";
import { TimelineFeed } from "./TimelineFeed";

export const metadata: Metadata = buildSiteMetadata({
  title: "发展历史",
  description: "回顾核聚变研究百年历程，了解关键里程碑、代表人物和未来展望。",
  path: "/site/history",
});

export default function HistoryPage() {
  return (
    <div className="content-page">
      <a href="/site" className="back-button">
        ← 返回首页
      </a>

      <h1>核聚变发展历史</h1>
      <p>
        核聚变研究经历了从理论假设、实验验证到大型工程建设的漫长旅程。一个世纪以来，全世界的科学家都在试图把恒星中的能量带到地球。下方时间线梳理了这一领域的关键事件、技术突破与合作进展。
      </p>

      <TimelineFeed />

      <section>
        <h2>重要科学家贡献</h2>
        <div className="company-grid">
          <div className="company-card">
            <div className="company-name">亚瑟·爱丁顿（Arthur Eddington）</div>
            <p>英国天体物理学家，首次提出恒星能量来源于核聚变反应，为聚变研究奠定理论基础。</p>
          </div>
          <div className="company-card">
            <div className="company-name">伊戈尔·塔姆（Igor Tamm）</div>
            <p>苏联物理学家，托卡马克概念的提出者之一，1958 年诺贝尔物理学奖获得者。</p>
          </div>
          <div className="company-card">
            <div className="company-name">安德烈·萨哈罗夫（Andrei Sakharov）</div>
            <p>苏联物理学家，托卡马克路线的重要奠基人，后来成为著名的人权活动家。</p>
          </div>
          <div className="company-card">
            <div className="company-name">莱曼·斯皮策（Lyman Spitzer）</div>
            <p>美国科学家，仿星器概念的提出者，普林斯顿等离子体物理实验室创始人。</p>
          </div>
          <div className="company-card">
            <div className="company-name">约翰·劳森（John Lawson）</div>
            <p>英国物理学家，提出著名的劳森判据，定义实现聚变点火所需的基本条件。</p>
          </div>
          <div className="company-card">
            <div className="company-name">爱德华·泰勒（Edward Teller）</div>
            <p>匈牙利裔美国物理学家，被称为“氢弹之父”，对聚变理论和工程均有深远影响。</p>
          </div>
        </div>
      </section>

      <section>
        <h2>技术发展里程碑</h2>
        <ul>
          <li>
            <strong>磁约束聚变：</strong>从早期磁镜装置发展到现代托卡马克与仿星器，设备规模与性能持续提升。
          </li>
          <li>
            <strong>惯性约束聚变：</strong>激光、离子束等驱动方案不断增强，为点火实验提供新的可能。
          </li>
          <li>
            <strong>等离子体加热：</strong>欧姆加热、射频加热、中性束注入协同应用，推动高温等离子体生成。
          </li>
          <li>
            <strong>等离子体控制：</strong>建立实时反馈与主动控制系统，提升稳定性与放电时长。
          </li>
          <li>
            <strong>材料科学：</strong>研发耐高热流、抗辐照材料，为聚变堆关键部件护航。
          </li>
          <li>
            <strong>超导技术：</strong>高温超导磁体为紧凑装置与高场装置打开全新工程路径。
          </li>
        </ul>
      </section>

      <section>
        <h2>未来展望</h2>
        <p>
          ITER 的建造、私人聚变公司的崛起以及 NIF 点火的突破，进一步增强了人们对聚变能源的信心。预计在 2030-2040 年代，我们将迎来首批实验性聚变电站的示范运行。要实现可持续、经济可行的聚变能源，还需要在材料、工程、控制与商业模式等方面持续创新与协作。
        </p>
      </section>
    </div>
  );
}
