import React, { useState, useEffect } from 'react';
import { useNotesStore } from '../../stores';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import MovingBorder from '../../components/ui/MovingBorder';
import NoteEditor from './components/NoteEditor';
import NotesList from './components/NotesList';

const NotesView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const { 
    notes, 
    currentNote, 
    isLoading, 
    error,
    fetchNotes, 
    setCurrentNote,
    searchNotes 
  } = useNotesStore();

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      await searchNotes(value);
    } else {
      await fetchNotes();
    }
  };

  const handleCreateNote = () => {
    setCurrentNote(null);
    setIsCreateModalOpen(false);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: any) => {
    setCurrentNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setCurrentNote(null);
  };

  if (isEditorOpen) {
    return (
      <NoteEditor 
        note={currentNote}
        onClose={handleCloseEditor}
        onSave={() => {
          handleCloseEditor();
          fetchNotes();
        }}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="搜索笔记..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-80"
          />
        </div>
        
        <MovingBorder
          speed="medium"
          borderColor="blue"
          className="inline-block"
        >
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <span className="mr-2">+</span>
            新建笔记
          </Button>
        </MovingBorder>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* 笔记列表 */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : (
          <NotesList 
            notes={notes}
            onEditNote={handleEditNote}
            searchTerm={searchTerm}
          />
        )}
      </div>

      {/* 创建笔记模态框 */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="创建新笔记"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">选择创建笔记的方式：</p>
          <div className="flex space-x-3">
            <Button
              onClick={handleCreateNote}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              空白笔记
            </Button>
            <Button
              onClick={handleCreateNote}
              variant="secondary"
              className="flex-1"
            >
              模板笔记
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default NotesView;