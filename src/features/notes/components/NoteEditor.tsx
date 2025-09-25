import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { useNotesStore, useTagsStore } from '../../../stores';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Note } from '../../../stores/notesStore';

interface NoteEditorProps {
  note?: Note | null;
  onClose: () => void;
  onSave: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const { createNote, updateNote } = useNotesStore();
  const { tags, fetchTags, createTag } = useTagsStore();

  useEffect(() => {
    fetchTags();
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSelectedTags(note.tags || []);
    }
  }, [note, fetchTags]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    setIsSaving(true);
    try {
      const noteData = {
        title: title.trim(),
        content: content || '',
        tags: selectedTags,
      };

      if (note) {
        await updateNote(note.id, noteData);
      } else {
        await createNote(noteData);
      }
      
      onSave();
    } catch (error) {
      console.error('保存笔记失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    
    try {
      await createTag({ name: newTag.trim(), color: '#3B82F6' });
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag('');
    } catch (error) {
      console.error('创建标签失败:', error);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      handleRemoveTag(tagName);
    } else {
      setSelectedTags([...selectedTags, tagName]);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <Button
            onClick={onClose}
            variant="secondary"
            className="text-gray-600"
          >
            ← 返回
          </Button>
          <Input
            type="text"
            placeholder="输入笔记标题..."
            value={title}
            onChange={setTitle}
            className="text-lg font-medium border-none focus:ring-0 px-0"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 标签管理 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm font-medium text-gray-700">标签:</span>
          <Input
            type="text"
            placeholder="添加标签..."
            value={newTag}
            onChange={setNewTag}
            className="text-sm w-32"
          />
          <Button
            onClick={handleAddTag}
            variant="secondary"
            className="text-sm px-3 py-1"
          >
            添加
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* 已选标签 */}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
          
          {/* 可选标签 */}
          {tags
            .filter(tag => !selectedTags.includes(tag.name))
            .map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.name)}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {tag.name}
              </button>
            ))}
        </div>
      </div>

      {/* Markdown 编辑器 */}
      <div className="flex-1 p-4">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          preview="edit"
          hideToolbar={false}
          visibleDragbar={false}
          textareaProps={{
            placeholder: '开始写作...',
            style: {
              fontSize: 14,
              lineHeight: 1.6,
            },
          }}
          height={400}
        />
      </div>
    </div>
  );
};

export default NoteEditor;