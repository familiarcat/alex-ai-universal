'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '@/styles/lcars.css';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/editor', label: 'Code Editor', icon: '🛡️' },
  ];

  return (
    <nav className="lcars-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🛡️</span>
              <span className="text-xl font-bold lcars-text-primary">Alex AI Universal</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`lcars-nav-item ${
                  pathname === item.href ? 'active' : ''
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
