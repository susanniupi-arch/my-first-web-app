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
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderCurrentView()}
    </Layout>
  );
}

export default App;