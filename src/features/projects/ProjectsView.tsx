import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import KanbanBoard from './components/KanbanBoard';
import { useProjectsStore } from '../../stores/projectsStore';

const ProjectsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  
  const {
    projects,
    currentProject,
    kanbanColumns,
    isLoading,
    fetchProjects,
    setCurrentProject,
    fetchKanbanColumns,
    moveTask,
    createTask,
    updateTask,
    deleteTask,
  } = useProjectsStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (selectedProjectId && viewMode === 'kanban') {
      fetchKanbanColumns(selectedProjectId);
    }
  }, [selectedProjectId, viewMode, fetchKanbanColumns]);

  const handleProjectSelect = (project: any) => {
    setCurrentProject(project);
    setSelectedProjectId(project.id);
    if (viewMode === 'kanban') {
      fetchKanbanColumns(project.id);
    }
  };

  const handleTaskMove = (taskId: string, sourceColumnId: string, destColumnId: string, destIndex: number) => {
    if (selectedProjectId) {
      moveTask(taskId, sourceColumnId, destColumnId, destIndex, selectedProjectId);
    }
  };

  const handleTaskCreate = (columnId: string, task: any) => {
    if (selectedProjectId) {
      createTask(selectedProjectId, columnId, task);
    }
  };

  const handleTaskUpdate = (taskId: string, updates: any) => {
    if (selectedProjectId) {
      updateTask(selectedProjectId, taskId, updates);
    }
  };

  const handleTaskDelete = (taskId: string) => {
    if (selectedProjectId) {
      deleteTask(selectedProjectId, taskId);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  // 看板视图
  if (viewMode === 'kanban' && selectedProjectId) {
    const columns = kanbanColumns[selectedProjectId] || [];
    
    return (
      <div className="h-full flex flex-col">
        {/* 工具栏 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setViewMode('grid');
                setSelectedProjectId(null);
                setCurrentProject(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentProject?.name} - 看板视图
            </h2>
          </div>
        </div>

        {/* 看板 */}
        <div className="flex-1">
          <KanbanBoard
            columns={columns}
            onTaskMove={handleTaskMove}
            onTaskCreate={handleTaskCreate}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">项目概览</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <Button onClick={() => console.log('新建项目')}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新建项目
        </Button>
      </div>

      {/* 项目列表 */}
      <div className="flex-1">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Card
                key={project.id}
                hover
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full animate-pulse-slow"
                      style={{ backgroundColor: project.color }}
                    />
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description}
                </p>
                
                {/* 进度条 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>进度</span>
                    <Badge variant="primary" size="sm">75%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-blue-600"
                      style={{
                        width: '75%',
                        animation: 'slideRight 1s ease-out',
                      }}
                    />
                  </div>
                </div>
                
                {/* 任务统计 */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span>9/12 任务完成</span>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>2024-02-15</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium shadow-md">
                      A
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium shadow-md">
                      B
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium shadow-md">
                      +2
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleProjectSelect(project)}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      }
                    >
                      查看详情
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setViewMode('kanban');
                        handleProjectSelect(project);
                      }}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2z" />
                        </svg>
                      }
                    >
                      看板视图
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                <div className="col-span-4">项目名称</div>
                <div className="col-span-2">进度</div>
                <div className="col-span-2">任务</div>
                <div className="col-span-2">截止日期</div>
                <div className="col-span-2">操作</div>
              </div>
            </div>
            
            {projects.map((project) => (
              <div key={project.id} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            backgroundColor: project.color,
                            width: '75%',
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">75%</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">9/12</span>
                  </div>
                  
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">2024-02-15</span>
                  </div>
                  
                  <div className="col-span-2">
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleProjectSelect(project)}
                      >
                        查看详情
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setViewMode('kanban');
                          handleProjectSelect(project);
                        }}
                      >
                        看板
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 空状态 */}
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg font-medium mb-2">还没有项目</p>
            <p className="text-sm mb-4">创建你的第一个项目开始管理工作</p>
            <Button onClick={() => console.log('新建项目')}>
              创建项目
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;