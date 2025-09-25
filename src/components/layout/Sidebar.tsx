import React from 'react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'notes', label: '笔记', icon: '📝' },
    { id: 'tasks', label: '任务', icon: '✅' },
    { id: 'pomodoro', label: '番茄钟', icon: '🍅' },
    { id: 'projects', label: '项目', icon: '📁' },
  ];

  return (
    <div className="w-64 bg-white/80 backdrop-blur-md border-r border-white/20 flex flex-col shadow-lg">
      <div className="p-6 border-b border-white/20">
        <h1 className="text-xl font-bold text-gray-800">生产力记事本</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-white/40 text-blue-700 border border-blue-200/50 shadow-sm backdrop-blur-sm'
                    : 'text-gray-700 hover:bg-white/30 hover:backdrop-blur-sm'
                }`}
              >
                <span className="text-lg mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;