'use client';

import { ReactNode } from 'react';

export default function PermitDetailLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-hidden">
      {children}
    </div>
  );
} 