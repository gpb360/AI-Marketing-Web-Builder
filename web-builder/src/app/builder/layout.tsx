import { ReactNode } from 'react';

interface BuilderLayoutProps {
  children: ReactNode;
}

export default function BuilderLayout({ children }: BuilderLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-canvas-bg">
      {children}
    </div>
  );
}
