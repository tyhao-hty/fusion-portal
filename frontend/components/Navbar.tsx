export function Navbar() {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex items-center justify-between p-4">
        <a href="/" className="font-semibold text-xl">
          Fusion Portal
        </a>
        <div className="space-x-4">
          <a href="/index.html" className="text-gray-700 hover:text-blue-600">
            旧版首页
          </a>
          <a href="/login" className="text-gray-700 hover:text-blue-600">
            登录
          </a>
          <a href="/register" className="text-gray-700 hover:text-blue-600">
            注册
          </a>
        </div>
      </div>
    </nav>
  );
}
