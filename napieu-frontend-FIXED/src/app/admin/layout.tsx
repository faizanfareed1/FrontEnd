'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Palette,
  Layout as LayoutIcon,
  Boxes,
  Home,
  LogOut,
  Menu,
  X,
  Radio
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/articles', label: 'Articles', icon: FileText },
    { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
    { href: '/admin/homepage-settings', label: 'Homepage Settings', icon: Home },
    { href: '/admin/live-ticker', label: 'Live Ticker', icon: Radio },
    { href: '/admin/media', label: 'Media', icon: Image },
    { href: '/admin/theme', label: 'Theme', icon: Palette },
  ];

  // FIXED: Exact path matching to prevent /admin/layout-sections from highlighting /admin/layout
  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    
    // Split paths into segments and compare exactly
    const pathSegments = pathname.split('/').filter(Boolean);
    const hrefSegments = href.split('/').filter(Boolean);
    
    // Must have same number of segments for exact match
    if (pathSegments.length !== hrefSegments.length) {
      return false;
    }
    
    // All segments must match
    return hrefSegments.every((segment, index) => segment === pathSegments[index]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-bold">NAPI EU</h1>
            <p className="text-sm text-gray-400 mt-1">Admin Panel</p>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className={`transition-all ${isSidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="p-8">
          {children}
        </div>
      </main>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}