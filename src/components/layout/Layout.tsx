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
    <div className="h-screen relative">
      <div className="absolute inset-0 opacity-20">
        <div className="dopamine-bounce absolute top-1/4 right-10 text-2xl" style={{animationDelay: '0.5s'}}>🌟</div>
        <div className="dopamine-pulse absolute bottom-1/3 left-10 text-3xl" style={{animationDelay: '1.5s'}}>💫</div>
        <div className="dopamine-spin absolute top-1/2 left-1/4 text-xl" style={{animationDelay: '2.5s'}}>🌸</div>
        <div className="dopamine-wiggle absolute bottom-1/4 right-1/3 text-2xl" style={{animationDelay: '3s'}}>🦄</div>
      </div>
      <div className="h-screen flex relative z-10">
        <Sidebar currentView={currentView} onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col">
          <Header currentView={currentView} />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;