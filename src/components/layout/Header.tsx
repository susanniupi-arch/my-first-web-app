import React from 'react';

interface HeaderProps {
  currentView: string;
}

const Header: React.FC<HeaderProps> = ({ currentView }) => {
  const getViewTitle = (view: string) => {
    switch (view) {
      case 'notes':
        return '📝 笔记管理';
      case 'tasks':
        return '✅任务管理';
      case 'pomodoro':
        return '🍅 番茄钟';
      case 'projects':
        return '📁 项目管理';
      default:
        return '📝 笔记管理';
    }
  };

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'notes':
        return '📝';
      case 'tasks':
        return '✅';
      case 'pomodoro':
        return '🍅';
      case 'projects':
        return '📁';
      default:
        return '📝';
    }
  };

  return (
    <header className="bg-white/60 backdrop-blur-md border-b border-white/20 px-6 py-4 shadow-sm dopamine-card">
      <h2 className="text-xl font-semibold dopamine-text dopamine-pulse">
        {getViewTitle(currentView)}
      </h2>
    </header>
  );
};

export default Header;