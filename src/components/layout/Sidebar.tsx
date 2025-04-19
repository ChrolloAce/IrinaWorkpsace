'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiCalendar, 
  FiCheckSquare,
  FiSettings
} from 'react-icons/fi';

// Logo component
const Logo = () => (
  <div className="flex items-center px-4 py-6">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white mr-3">C</div>
    <span className="text-lg font-medium">Catalog</span>
  </div>
);

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
};

const NavItem = ({ href, icon, label, active }: NavItemProps) => (
  <Link href={href} className={`sidebar-item ${active ? 'active' : ''}`}>
    {icon}
    <span>{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { 
      href: '/', 
      icon: <FiHome size={18} />, 
      label: 'Dashboard' 
    },
    { 
      href: '/clients', 
      icon: <FiUsers size={18} />, 
      label: 'Clients' 
    },
    { 
      href: '/permits', 
      icon: <FiFileText size={18} />, 
      label: 'Permits' 
    },
    { 
      href: '/calendar', 
      icon: <FiCalendar size={18} />, 
      label: 'Calendar' 
    },
    { 
      href: '/checklists', 
      icon: <FiCheckSquare size={18} />, 
      label: 'Checklists' 
    },
  ];

  return (
    <div className="h-full w-64 border-r border-gray-100 bg-white flex flex-col">
      <Logo />
      
      <nav className="flex-1 mt-6 px-3 space-y-1">
        {navigation.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-100">
        <NavItem
          href="/settings"
          icon={<FiSettings size={18} />}
          label="Settings"
          active={pathname === '/settings'}
        />
      </div>
    </div>
  );
} 