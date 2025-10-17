export default function Home() {
  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold">核聚变门户网站</h1>
      <p className="text-lg text-gray-700">
        欢迎来到核聚变知识门户。这是一个汇聚聚变历史、技术、论文与产业动态的开放站点。
      </p>
      <p className="text-gray-600">
        当前站点正在重构为动态版本，您仍可访问旧版页面于{' '}
        <a href="/index.html" className="text-blue-600 underline">
          这里
        </a>
        。
      </p>
    </div>
  );
}
