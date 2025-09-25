import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Button from '../../../components/ui/Button';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  tags: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
  color: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  onTaskMove: (taskId: string, sourceColumnId: string, destColumnId: string, destIndex: number) => void;
  onTaskCreate: (columnId: string, task: Omit<KanbanTask, 'id'>) => void;
  onTaskUpdate: (taskId: string, updates: Partial<KanbanTask>) => void;
  onTaskDelete: (taskId: string) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  onTaskMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [showNewTaskForm, setShowNewTaskForm] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    onTaskMove(draggableId, source.droppableId, destination.droppableId, destination.index);
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

  return (
    <div className="h-full flex flex-col">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 flex space-x-4 overflow-x-auto p-4">
          {columns.map((column) => (
            <div key={column.id} className="w-80 flex-shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  <h3 className="font-medium text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500">({column.tasks.length})</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNewTaskForm(column.id)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </Button>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[200px] p-2 rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200 cursor-move transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                              <button
                                onClick={() => onTaskDelete(task.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            {task.description && (
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                {task.tags.length > 0 && (
                                  <div className="flex space-x-1">
                                    {task.tags.slice(0, 2).map((tag, tagIndex) => (
                                      <span
                                        key={tagIndex}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {task.tags.length > 2 && (
                                      <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              {task.assignee && (
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                  {task.assignee.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {task.dueDate && (
                              <div className="mt-2 text-xs text-gray-500">
                                截止: {task.dueDate}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* 新建任务表单 */}
                    {showNewTaskForm === column.id && (
                      <NewTaskForm
                        onSubmit={(task) => {
                          onTaskCreate(column.id, task);
                          setShowNewTaskForm(null);
                        }}
                        onCancel={() => setShowNewTaskForm(null)}
                      />
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

interface NewTaskFormProps {
  onSubmit: (task: Omit<KanbanTask, 'id'>) => void;
  onCancel: () => void;
}

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assignee: '',
    dueDate: '',
    tags: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSubmit({
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
    });
  };

  return (
    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="任务标题"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2"
          autoFocus
        />
        
        <textarea
          placeholder="任务描述（可选）"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm mb-2 resize-none"
          rows={2}
        />

        <div className="flex items-center space-x-2 mb-2">
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="low">低优先级</option>
            <option value="medium">中优先级</option>
            <option value="high">高优先级</option>
          </select>

          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" size="sm">
            创建
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KanbanBoard;