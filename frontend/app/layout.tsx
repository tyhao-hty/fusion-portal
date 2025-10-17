import './globals.css';
import { Navbar } from '../components/Navbar';

export const metadata = {
  title: 'Fusion Portal',
  description: 'A modern nuclear fusion knowledge portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="bg-gray-50 text-gray-900">
        <Navbar />
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
