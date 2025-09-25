import React from 'react';
import { Task } from '../../../stores/tasksStore';
import Card3D from '../../../components/ui/Card3D';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高优先级';
      case 'medium':
        return '中优先级';
      case 'low':
        return '低优先级';
      default:
        return '普通';
    }
  };

  return (
    <Card3D
      className="mb-3"
      perspective={1000}
      maxRotation={8}
      scale={1.05}
      glare={true}
      borderGlow={false}
    >
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task.id)}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            <div className="flex items-center space-x-2">
              {!task.completed && (
                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
              )}
              {task.completed && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  已完成
                </span>
              )}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onEdit(task)}
                  className="text-gray-400 hover:text-blue-600 p-1"
                  title="编辑任务"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-gray-400 hover:text-red-600 p-1"
                  title="删除任务"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {task.description && (
            <p className={`text-sm mt-1 ${
              task.completed ? 'text-gray-500 line-through' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {task.project_id && (
                <span>📁 项目 {task.project_id}</span>
              )}
              {task.due_date && (
                <span className={task.completed ? '' : 'text-orange-600'}>
                  📅 {formatDate(task.due_date)}
                </span>
              )}
            </div>
            <span>
              {task.completed ? `完成于 ${formatDate(task.updated_at)}` : `创建于 ${formatDate(task.created_at)}`}
            </span>
          </div>
        </div>
      </div>
      </div>
    </Card3D>
  );
};

export default TaskItem;