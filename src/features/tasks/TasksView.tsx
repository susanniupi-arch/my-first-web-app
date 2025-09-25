import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import TaskItem from './components/TaskItem';
import TaskForm from './components/TaskForm';
import { useTasksStore } from '../../stores/tasksStore';
import { Task, CreateTaskRequest } from '../../stores/tasksStore';

const TasksView: React.FC = () => {
  const {
    tasks,
    isLoading,
    error,
    filter,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    updateTaskPosition,
    setFilter,
  } = useTasksStore();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'pending':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  }).sort((a, b) => a.position - b.position);

  const getFilterCounts = () => {
    const pending = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    return {
      all: tasks.length,
      pending,
      completed,
    };
  };

  const counts = getFilterCounts();

  const filterButtons = [
    { key: 'all', label: '全部', count: counts.all },
    { key: 'pending', label: '待完成', count: counts.pending },
    { key: 'completed', label: '已完成', count: counts.completed },
  ];

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormSubmit = async (taskData: CreateTaskRequest) => {
    try {
      if (editingTask) {
        await updateTask({
          id: editingTask.id,
          ...taskData,
        });
      } else {
        await createTask(taskData);
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      await deleteTask(id);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reorderedTasks = Array.from(filteredTasks);
    const [removed] = reorderedTasks.splice(sourceIndex, 1);
    reorderedTasks.splice(destinationIndex, 0, removed);

    // 更新任务位置
    const taskId = parseInt(result.draggableId);
    const newPosition = destinationIndex + 1;
    updateTaskPosition(taskId, newPosition);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载任务时出错: {error}</p>
          <Button onClick={fetchTasks}>重试</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <Card className="p-4 mb-6 bg-gradient-to-r from-white to-gray-50 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setFilter(btn.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                  filter === btn.key
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100 hover:shadow-md'
                }`}
              >
                {btn.label}
                <Badge 
                  variant={filter === btn.key ? 'primary' : 'default'} 
                  size="sm" 
                  className="ml-2"
                >
                  {btn.count}
                </Badge>
              </button>
            ))}
          </div>
          
          <Button 
            onClick={handleCreateTask}
            className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新建任务
          </Button>
        </div>
      </Card>

      {/* 任务列表 */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-white border-gray-200">
            <div className="animate-bounce-in">
              <svg className="w-20 h-20 mb-6 text-gray-300 mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-xl font-semibold text-gray-700 mb-3">
                {filter === 'pending' ? '🎯 没有待完成的任务' : 
                 filter === 'completed' ? '✅ 没有已完成的任务' : '📝 还没有任务'}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                {filter === 'all' ? '创建你的第一个任务开始管理待办事项' : 
                 filter === 'pending' ? '所有任务都已完成，真棒！' :
                 '完成一些任务来查看进度'}
              </p>
              {filter === 'all' && (
                <Button 
                  onClick={handleCreateTask}
                  size="lg"
                  className="shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  创建第一个任务
                </Button>
              )}
              <div className="mt-6">
                <Badge variant="info" size="sm">💡 提示：拖拽任务可以调整顺序</Badge>
              </div>
            </div>
          </Card>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {filteredTasks.map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`${snapshot.isDragging ? 'opacity-75' : ''}`}
                        >
                          <TaskItem
                            task={task}
                            onToggleComplete={toggleTaskComplete}
                            onEdit={handleEditTask}
                            onDelete={handleDeleteTask}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* 任务表单模态框 */}
      {showForm && (
        <TaskForm
          task={editingTask || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default TasksView;