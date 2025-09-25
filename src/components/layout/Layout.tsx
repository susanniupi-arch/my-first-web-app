import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import AuroraBackground from '../ui/AuroraBackground';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  return (
    <AuroraBackground className="h-screen">
      <div className="h-screen flex">
        <Sidebar currentView={currentView} onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col">
          <Header currentView={currentView} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default Layout;