import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import NotesView from './features/notes/NotesView';
import TasksView from './features/tasks/TasksView';
import PomodoroView from './features/pomodoro/PomodoroView';
import ProjectsView from './features/projects/ProjectsView';

function App() {
  const [currentView, setCurrentView] = useState('notes');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'notes':
        return <NotesView />;
      case 'tasks':
        return <TasksView />;
      case 'pomodoro':
        return <PomodoroView />;
      case 'projects':
        return <ProjectsView />;
      default:
        return <NotesView />;
    }
  };

  return (
    <div className="dopamine-bg min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="dopamine-bounce absolute top-10 left-10 text-4xl">🌈</div>
        <div className="dopamine-spin absolute top-20 right-20 text-3xl">⭐</div>
        <div className="dopamine-pulse absolute bottom-20 left-20 text-3xl">💖</div>
        <div className="dopamine-wiggle absolute bottom-10 right-10 text-4xl">🦄</div>
        <div className="dopamine-bounce absolute top-1/2 left-1/4 text-2xl" style={{animationDelay: '1s'}}>🌸</div>
        <div className="dopamine-spin absolute top-1/3 right-1/3 text-2xl" style={{animationDelay: '2s'}}>🌺</div>
      </div>
      <div className="relative z-10">
        <Layout currentView={currentView} onViewChange={setCurrentView}>
          {renderCurrentView()}
        </Layout>
      </div>
    </div>
  );
}

export default App;