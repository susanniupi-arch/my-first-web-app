import React from 'react';
import { Note } from '../../../stores/notesStore';
import Button from '../../../components/ui/Button';
import GlowingBorder from '../../../components/ui/GlowingBorder';
import Card3D from '../../../components/ui/Card3D';

interface NotesListProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  searchTerm: string;
}

const NotesList: React.FC<NotesListProps> = ({ notes, onEditNote, searchTerm }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPreviewText = (content: string, maxLength: number = 150) => {
    // 移除 Markdown 语法
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // 移除标题
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体
      .replace(/`(.*?)`/g, '$1') // 移除行内代码
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接
      .replace(/\n/g, ' ') // 替换换行符
      .trim();

    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...' 
      : plainText;
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 dopamine-card rounded-2xl mx-4">
        <div className="text-6xl mb-4 dopamine-bounce">📝</div>
        <h3 className="text-lg font-medium dopamine-text mb-2 dopamine-pulse">
          {searchTerm ? '没有找到相关笔记 ✨' : '还没有笔记 🌟'}
        </h3>
        <p className="text-sm mb-4 dopamine-text opacity-80">
          {searchTerm ? '尝试使用不同的关键词搜索' : '创建你的第一个笔记开始记录想法'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Card3D
          key={note.id}
          className="cursor-pointer"
          perspective={1200}
          maxRotation={12}
          scale={1.08}
          glare={true}
          borderGlow={true}
          onClick={() => onEditNote(note)}
        >
          <div className="dopamine-card rounded-lg border border-gray-200 p-4 hover:dopamine-glow transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold dopamine-text line-clamp-2 flex-1 dopamine-rainbow">
                {note.title}
              </h3>
              <div className="flex items-center space-x-1 ml-2">
                <Button
                  variant="ghost"
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    // 这里可以添加更多操作，如删除、收藏等
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </Button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-3 dopamine-text opacity-80">
              {getPreviewText(note.content)}
            </p>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{formatDate(note.updated_at)}</span>
              <div className="flex flex-wrap gap-1">
                {note.tags?.slice(0, 2).map((tag: string) => (
                  <span
                    key={tag}
                    className="dopamine-button text-white px-2 py-1 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {note.tags && note.tags.length > 2 && (
                  <span className="text-gray-400">
                    +{note.tags.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card3D>
      ))}
    </div>
  );
};

export default NotesList;