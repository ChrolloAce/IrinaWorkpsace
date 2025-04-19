'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiCalendar, 
  FiCheckSquare,
  FiSettings,
  FiMenu,
  FiX
} from 'react-icons/fi';

// Logo component
const Logo = () => (
  <div className="flex items-center px-4 py-5">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white mr-3">P</div>
    <span className="text-lg font-medium">Permit Manager</span>
  </div>
);

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
};

const NavItem = ({ href, icon, label, active, onClick }: NavItemProps) => (
  <Link 
    href={href} 
    className={`sidebar-item ${active ? 'active' : ''}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const navigation = [
    { 
      href: '/', 
      icon: <FiHome size={18} />, 
      label: 'Dashboard',
      active: pathname === '/'
    },
    { 
      href: '/clients', 
      icon: <FiUsers size={18} />, 
      label: 'Clients',
      active: pathname === '/clients' || pathname.startsWith('/clients/')
    },
    { 
      href: '/permits', 
      icon: <FiFileText size={18} />, 
      label: 'Permits',
      active: pathname === '/permits' || pathname.startsWith('/permits/')
    },
    { 
      href: '/calendar', 
      icon: <FiCalendar size={18} />, 
      label: 'Calendar',
      active: pathname === '/calendar'
    },
    { 
      href: '/checklists', 
      icon: <FiCheckSquare size={18} />, 
      label: 'Checklists',
      active: pathname === '/checklists' || pathname.startsWith('/checklists/')
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-20">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white shadow-md text-gray-600"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-10 h-full w-64 border-r border-gray-100 bg-white flex flex-col transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Logo />
        
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={item.active}
              onClick={closeSidebar}
            />
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <NavItem
            href="/settings"
            icon={<FiSettings size={18} />}
            label="Settings"
            active={pathname === '/settings'}
            onClick={closeSidebar}
          />
        </div>
      </div>
    </>
  );
} 