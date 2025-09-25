### 🤖 Assistant

# Tauri 全功能生产力记事本应用 - 开发文档

## 目录
1. [项目概述](#1-项目概述)
2. [系统架构](#2-系统架构)
3. [技术栈详情](#3-技术栈详情)
4. [开发环境配置](#4-开发环境配置)
5. [功能模块实现指南](#5-功能模块实现指南)
6. [数据库设计](#6-数据库设计)
7. [前端组件设计](#7-前端组件设计)
8. [状态管理](#8-状态管理)
9. [API接口设计](#9-api接口设计)
10. [测试策略](#10-测试策略)
11. [构建与部署](#11-构建与部署)
12. [开发规范](#12-开发规范)
13. [性能优化考量](#13-性能优化考量)
14. [开发里程碑计划](#14-开发里程碑计划)

---

## 1. 项目概述

### 1.1 产品定位
本应用是一个集成笔记管理、待办事项、番茄钟和项目管理功能的全能生产力工具，使用Tauri框架开发，确保跨平台兼容性和本地数据存储的隐私安全。

### 1.2 目标用户
- 专业人士和知识工作者
- 学生和研究人员
- 项目管理者和团队成员
- 个人生产力爱好者

### 1.3 核心价值主张
- 一站式解决个人工作流管理需求
- 功能模块高度集成与关联
- 隐私安全（所有数据本地存储）
- 高性能与低资源占用
- 跨平台兼容性

---

## 2. 系统架构

### 2.1 总体架构
![系统架构图示意](https://example.com/architecture-diagram.png)

应用采用典型的Tauri架构：
- **前端层**：使用React构建UI和交互逻辑
- **Tauri核心层**：连接前端与后端，处理窗口管理、系统API等
- **后端层**：使用Rust实现核心功能和数据存储

### 2.2 模块结构
```
app/
├── src-tauri/                 # Rust后端代码
│   ├── src/                   # Rust源代码
│   │   ├── main.rs            # 应用入口
│   │   ├── db/                # 数据库模块
│   │   ├── commands/          # 前端可调用的命令
│   │   └── models/            # 数据模型定义
│   ├── Cargo.toml             # Rust依赖配置
│   └── tauri.conf.json        # Tauri配置
├── src/                       # 前端React代码
│   ├── main.tsx               # 前端入口
│   ├── App.tsx                # 主应用组件
│   ├── components/            # 通用UI组件
│   ├── features/              # 功能模块组件
│   │   ├── notes/             # 笔记功能模块
│   │   ├── tasks/             # 待办事项模块
│   │   ├── pomodoro/          # 番茄钟模块
│   │   └── projects/          # 项目管理模块
│   ├── stores/                # 状态管理
│   ├── utils/                 # 工具函数
│   └── styles/                # 样式文件
├── package.json               # 前端依赖配置
└── vite.config.ts             # Vite构建配置
```

### 2.3 数据流动
1. 用户通过UI交互触发动作
2. React组件调用状态管理库(Zustand)更新前端状态
3. 状态变更触发对Tauri后端API的调用
4. Rust后端处理请求并与SQLite数据库交互
5. 返回结果给前端并更新UI

---

## 3. 技术栈详情

### 3.1 前端技术
- **框架**: React 18+
- **语言**: TypeScript 5.0+
- **构建工具**: Vite 4.0+
- **状态管理**: Zustand 4.0+
- **样式**: TailwindCSS 3.0+
- **编辑器**: CodeMirror 6
- **Markdown渲染**: React-Markdown + Remark/Rehype插件
- **图表**: Recharts 2.0+
- **日期处理**: Day.js
- **拖拽功能**: React DnD 16.0+
- **表单**: React Hook Form + Zod验证

### 3.2 后端技术
- **框架**: Tauri 1.5+
- **语言**: Rust 1.70+
- **数据库**: SQLite 3
- **数据库ORM**: rusqlite + r2d2(连接池)
- **Tauri插件**:
 - tauri-plugin-sql
 - tauri-plugin-store
 - tauri-plugin-notification
 - tauri-plugin-fs
 - tauri-plugin-window-state

### 3.3 开发工具
- **IDE**: Visual Studio Code
- **版本控制**: Git
- **包管理器**: npm/pnpm
- **测试框架**: Vitest(前端), Rust Test(后端)
- **CI/CD**: GitHub Actions

---

## 4. 开发环境配置

### 4.1 必备环境
- Node.js (v18+)
- Rust (1.70+)
- VS Code (推荐)
- Git

### 4.2 项目初始化步骤
```bash
# 安装Tauri CLI
npm install -g @tauri-apps/cli

# 创建新项目
npm create tauri-app@latest app-name
cd app-name

# 选择React+TypeScript+Vite模板

# 安装依赖
npm install

# 安装必要前端依赖
npm install zustand react-markdown codemirror @uiw/react-codemirror \
  tailwindcss postcss autoprefixer dayjs recharts react-dnd react-dnd-html5-backend \
  react-hook-form zod @hookform/resolvers uuid nanoid

# 配置Tailwind CSS
npx tailwindcss init -p

# 启动开发服务器
npm run tauri dev
```

### 4.3 开发环境特定配置
1. **VS Code插件推荐**:
 - Tauri
 - Rust Analyzer
 - ESLint
 - Prettier
 - Tailwind CSS IntelliSense

2. **开发环境变量**:
```
   # .env.development
   VITE_DEV_MODE=true
   VITE_LOG_LEVEL=debug
   ```

---

## 5. 功能模块实现指南

### 5.1 笔记管理模块

#### 5.1.1 核心功能实现
1. **Markdown编辑器实现**:
   ```tsx
   import { useCallback } from 'react';
   import CodeMirror from '@uiw/react-codemirror';
   import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
   import { languages } from '@codemirror/language-data';
   
   export const MarkdownEditor = ({ value, onChange }) => {
     const handleChange = useCallback((value) => {
       onChange(value);
     }, [onChange]);
   
     return (
       <CodeMirror
         value={value}
         height="100%"
         extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
         onChange={handleChange}
         theme="light"
         className="border rounded-md"
       />
     );
   };
   ```

2. **笔记数据管理**:
   ```rust
   // src-tauri/src/commands/notes.rs
   #[tauri::command]
   pub fn create_note(title: String, content: String, db: State<'_, DbConnection>) -> Result<Note, String> {
       let conn = db.0.lock().map_err(|_| "Failed to lock database connection")?;
       
       let mut stmt = conn.prepare(
           "INSERT INTO notes (id, title, content, created_at, updated_at) 
            VALUES (?, ?, ?, datetime('now'), datetime('now'))"
       ).map_err(|e| e.to_string())?;
       
       let id = uuid::Uuid::new_v4().to_string();
       stmt.execute(params![id, title, content]).map_err(|e| e.to_string())?;
       
       Ok(Note {
           id,
           title,
           content,
           created_at: chrono::Utc::now(),
           updated_at: chrono::Utc::now(),
           project_id: None,
       })
   }
   ```

#### 5.1.2 关键UI组件
- **笔记列表组件**：显示所有笔记，支持排序和筛选
- **笔记编辑界面**：集成Markdown编辑器和预览
- **标签管理组件**：创建、分配和管理标签

#### 5.1.3 数据流和状态管理
```typescript
// src/stores/noteStore.ts
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';

interface Note {
id: string;
title: string;
content: string;
created_at: string;
updated_at: string;
project_id?: string;
}

interface NoteStore {
notes: Note[];
currentNote: Note | null;
isLoading: boolean;
fetchNotes: () => Promise<void>;
createNote: (title: string, content: string) => Promise<void>;
updateNote: (id: string, data: Partial<Note>) => Promise<void>;
deleteNote: (id: string) => Promise<void>;
setCurrentNote: (note: Note | null) => void;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
notes: [],
currentNote: null,
isLoading: false,

fetchNotes: async () => {
 set({ isLoading: true });
 try {
 const notes = await invoke<Note[]>('get_all_notes');
 set({ notes, isLoading: false });
 } catch (error) {
 console.error('Failed to fetch notes:', error);
 set({ isLoading: false });
 }
},

createNote: async (title, content) => {
 try {
 const newNote = await invoke<Note>('create_note', { title, content });
 set(state => ({
 notes: [...state.notes, newNote],
 currentNote: newNote
 }));
 } catch (error) {
 console.error('Failed to create note:', error);
 }
},

updateNote: async (id, data) => {
 try {
 await invoke('update_note', { id, ...data });
 set(state => ({
 notes: state.notes.map(note =>
 note.id === id ? { ...note, ...data, updated_at: new Date().toISOString() } : note
 ),
 currentNote: state.currentNote?.id === id
 ? { ...state.currentNote, ...data, updated_at: new Date().toISOString() }
 : state.currentNote
 }));
 } catch (error) {
 console.error('Failed to update note:', error);
 }
},

deleteNote: async (id) => {
 try {
 await invoke('delete_note', { id });
 set(state => ({
 notes: state.notes.filter(note => note.id !== id),
 currentNote: state.currentNote?.id === id ? null : state.currentNote
 }));
 } catch (error) {
 console.error('Failed to delete note:', error);
 }
},

setCurrentNote: (note) => set({ currentNote: note })
}));
```

### 5.2 待办事项模块

#### 5.2.1 核心功能实现
- 任务CRUD操作
- 拖拽排序实现
- 子任务实现
- 过滤和排序系统

#### 5.2.2 任务列表与拖拽排序实现
```tsx
import { useDrag, useDrop } from 'react-dnd';

const TaskItem = ({ task, index, moveTask }) => {
const [{ isDragging }, drag] = useDrag({
 type: 'TASK',
 item: { id: task.id, index },
 collect: (monitor) => ({
 isDragging: monitor.isDragging(),
 }),
});

const [, drop] = useDrop({
 accept: 'TASK',
 hover: (draggedItem) => {
 if (draggedItem.index !== index) {
 moveTask(draggedItem.index, index);
 draggedItem.index = index;
 }
 },
});

return (
 <div
 ref={(node) => drag(drop(node))}
 className={`p-3 mb-2 border rounded-md ${isDragging ? 'opacity-50' : ''}`}
 >
 <h3 className="font-medium">{task.title}</h3>
 <p className="text-sm text-gray-600">{task.description}</p>
 {/* 优先级、日期等其他信息 */}
 </div>
);
};
```

### 5.3 番茄钟模块

#### 5.3.1 计时器实现
```tsx
import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

export const PomodoroTimer = () => {
const [timeLeft, setTimeLeft] = useState(25 * 60); // 25分钟
const [isActive, setIsActive] = useState(false);
const [isWorkSession, setIsWorkSession] = useState(true);
const [sessionId, setSessionId] = useState(null);

const startTimer = useCallback(async () => {
 if (!isActive) {
 // 创建新的番茄钟会话
 const newSessionId = await invoke('create_pomodoro_session');
 setSessionId(newSessionId);
 setIsActive(true);
 }
}, [isActive]);

const pauseTimer = useCallback(() => {
 setIsActive(false);
}, []);

const resetTimer = useCallback(() => {
 setIsActive(false);
 setTimeLeft(isWorkSession ? 25 * 60 : 5 * 60);
}, [isWorkSession]);

const completeSession = useCallback(async () => {
 if (sessionId) {
 await invoke('complete_pomodoro_session', { id: sessionId });
 setSessionId(null);
 }

 // 切换到休息时间或工作时间
 setIsWorkSession(!isWorkSession);
 setTimeLeft(!isWorkSession ? 25 * 60 : 5 * 60);
 setIsActive(false);
}, [sessionId, isWorkSession]);

useEffect(() => {
 let interval = null;

 if (isActive && timeLeft > 0) {
 interval = setInterval(() => {
 setTimeLeft(timeLeft => timeLeft - 1);
 }, 1000);
 } else if (isActive && timeLeft === 0) {
 // 时间到，发送通知
 invoke('send_notification', {
 title: isWorkSession ? '工作时间结束!' : '休息时间结束!',
 body: isWorkSession ? '该休息了!' : '回到工作吧!'
 });

 completeSession();
 clearInterval(interval);
 }

 return () => clearInterval(interval);
}, [isActive, timeLeft, isWorkSession, completeSession]);

// 将秒转换为分:秒格式
const formatTime = (seconds) => {
 const mins = Math.floor(seconds / 60);
 const secs = seconds % 60;
 return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

return (
 <div className="flex flex-col items-center p-6 border rounded-lg shadow-sm">
 <h2 className="text-2xl font-bold mb-4">
 {isWorkSession ? '工作时间' : '休息时间'}
 </h2>

 <div className="text-6xl font-mono my-6">
 {formatTime(timeLeft)}
 </div>

 <div className="flex space-x-4">
 {!isActive ? (
 <button
 onClick={startTimer}
 className="px-4 py-2 bg-green-500 text-white rounded-md"
 >
 开始
 </button>
 ) : (
 <button
 onClick={pauseTimer}
 className="px-4 py-2 bg-yellow-500 text-white rounded-md"
 >
 暂停
 </button>
 )}

 <button
 onClick={resetTimer}
 className="px-4 py-2 bg-gray-300 rounded-md"
 >
 重置
 </button>
 </div>
 </div>
);
};
```

### 5.4 项目管理模块

#### 5.4.1 看板视图实现
```tsx
import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const KanbanBoard = ({ columns, tasks, onTaskMove }) => {
return (
 <DndProvider backend={HTML5Backend}>
 <div className="flex space-x-4 overflow-x-auto p-4">
 {columns.map(column => (
 <KanbanColumn
 key={column.id}
 column={column}
 tasks={tasks.filter(task => task.columnId === column.id)}
 onTaskMove={onTaskMove}
 />
 ))}
 </div>
 </DndProvider>
);
};

const KanbanColumn = ({ column, tasks, onTaskMove }) => {
const [{ isOver }, drop] = useDrop({
 accept: 'KANBAN_TASK',
 drop: (item) => {
 onTaskMove(item.id, column.id);
 },
 collect: (monitor) => ({
 isOver: !!monitor.isOver(),
 }),
});

return (
 <div
 ref={drop}
 className={`w-64 flex-shrink-0 flex flex-col border rounded-md ${
 isOver ? 'bg-blue-50' : 'bg-gray-50'
 }`}
 >
 <div className="p-3 border-b bg-gray-100 font-medium">
 {column.name} ({tasks.length})
 </div>
 <div className="flex-1 p-2 overflow-y-auto max-h-[70vh]">
 {tasks.map(task => (
 <KanbanTask key={task.id} task={task} />
 ))}
 </div>
 </div>
);
};

const KanbanTask = ({ task }) => {
const [{ isDragging }, drag] = useDrag({
 type: 'KANBAN_TASK',
 item: { id: task.id },
 collect: (monitor) => ({
 isDragging: !!monitor.isDragging(),
 }),
});

return (
 <div
 ref={drag}
 className={`p-2 mb-2 bg-white border rounded-md shadow-sm cursor-move ${
 isDragging ? 'opacity-50' : ''
 }`}
 >
 <div className="font-medium">{task.title}</div>
 <div className="text-sm text-gray-600 truncate">{task.description}</div>
 {/* 其他任务信息 */}
 </div>
);
};
```

---

## 6. 数据库设计

### 6.1 表结构设计

#### 6.1.1 笔记表(notes)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| id | TEXT | 主键，UUID |
| title | TEXT | 笔记标题 |
| content | TEXT | 笔记内容(Markdown) |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| project_id | TEXT | 关联项目ID(可空) |

#### 6.1.2 标签表(tags)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| id | TEXT | 主键，UUID |
| name | TEXT | 标签名称 |
| color | TEXT | 标签颜色(HEX) |

#### 6.1.3 笔记-标签关联表(note_tags)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| note_id | TEXT | 笔记ID(外键) |
| tag_id | TEXT | 标签ID(外键) |

#### 6.1.4 任务表(tasks)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| id | TEXT | 主键，UUID |
| title | TEXT | 任务标题 |
| description | TEXT | 任务描述 |
| is_completed | INTEGER | 是否完成(0/1) |
| priority | INTEGER | 优先级(1-4) |
| due_date | TEXT | 截止日期(可空) |
| remind_at | TEXT | 提醒时间(可空) |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| project_id | TEXT | 关联项目ID(可空) |
| parent_id | TEXT | 父任务ID(可空) |
| position | INTEGER | 排序位置 |

#### 6.1.5 番茄钟会话表(pomodoro_sessions)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| id | TEXT | 主键，UUID |
| started_at | TEXT | 开始时间 |
| ended_at | TEXT | 结束时间(可空) |
| duration | INTEGER | 持续时间(秒) |
| is_completed | INTEGER | 是否完成(0/1) |
| task_id | TEXT | 关联任务ID(可空) |
| notes | TEXT | 会话笔记 |

#### 6.1.6 项目表(projects)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| id | TEXT | 主键，UUID |
| name | TEXT | 项目名称 |
| description | TEXT | 项目描述 |
| status | TEXT | 项目状态 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
| due_date | TEXT | 截止日期(可空) |
| color | TEXT | 项目颜色(HEX) |

#### 6.1.7 看板列表(kanban_columns)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| id | TEXT | 主键，UUID |
| project_id | TEXT | 所属项目ID |
| name | TEXT | 列名称 |
| position | INTEGER | 排序位置 |

#### 6.1.8 任务-看板列关联表(column_tasks)
| 字段名 | 类型 | 说明 |
|-------|------|------|
| task_id | TEXT | 任务ID |
| column_id | TEXT | 看板列ID |
| position | INTEGER | 排序位置 |

### 6.2 数据库初始化
```rust
// src-tauri/src/db/init.rs
use rusqlite::{Connection, Result};

pub fn init_database(conn: &Connection) -> Result<()> {
 // 创建笔记表
 conn.execute(
 "CREATE TABLE IF NOT EXISTS notes (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 content TEXT NOT NULL,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 project_id TEXT
 )",
 [],
 )?;

 // 创建标签表
 conn.execute(
 "CREATE TABLE IF NOT EXISTS tags (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 color TEXT NOT NULL
 )",
 [],
 )?;

 // 创建笔记-标签关联表
 conn.execute(
 "CREATE TABLE IF NOT EXISTS note_tags (
 note_id TEXT NOT NULL,
 tag_id TEXT NOT NULL,
 PRIMARY KEY (note_id, tag_id),
 FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
 FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
 )",
 [],
 )?;

 // 创建任务表
 conn.execute(
 "CREATE TABLE IF NOT EXISTS tasks (
 id TEXT PRIMARY KEY,
 title TEXT NOT NULL,
 description TEXT,
 is_completed INTEGER NOT NULL DEFAULT 0,
 priority INTEGER NOT NULL DEFAULT 3,
 due_date TEXT,
 remind_at TEXT,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 project_id TEXT,
 parent_id TEXT,
 position INTEGER NOT NULL,
 FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE
 )",
 [],
 )?;

 // 其他表创建语句...

 Ok(())
}
```

---

## 7. 前端组件设计

### 7.1 组件层次结构

```
App
├── AppLayout
│ ├── Sidebar
│ │ ├── NavigationMenu
│ │ └── ContextPanel (条件渲染)
│ ├── MainContent
│ │ ├── NotesView
│ │ │ ├── NotesList
│ │ │ ├── NoteEditor
│ │ │ └── NotePreview
│ │ ├── TasksView
│ │ │ ├── TaskList
│ │ │ ├── TaskDetail
│ │ │ └── TaskFilters
│ │ ├── PomodoroView
│ │ │ ├── PomodoroTimer
│ │ │ ├── SessionHistory
│ │ │ └── PomodoroSettings
│ │ └── ProjectsView
│ │ ├── ProjectList
│ │ ├── ProjectDetail
│ │ ├── KanbanBoard
│ │ └── ProjectTimeline
│ └── StatusBar
└── SettingsModal
```

### 7.2 关键组件示例

#### 7.2.1 应用布局组件
```tsx
// src/components/layout/AppLayout.tsx
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { StatusBar } from './StatusBar';

export const AppLayout = ({ children }) => {
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

return (
 <div className="h-screen flex flex-col">
 <div className="flex-1 flex overflow-hidden">
 <Sidebar
 collapsed={sidebarCollapsed}
 onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
 />
 <MainContent>
 {children}
 </MainContent>
 </div>
 <StatusBar />
 </div>
);
};
```

#### 7.2.2 标签选择器组件
```tsx
// src/components/TagSelector.tsx
import { useState, useEffect } from 'react';
import { useTagStore } from '../stores/tagStore';

export const TagSelector = ({ selectedTags = [], onChange }) => {
const { tags, fetchTags } = useTagStore();
const [isOpen, setIsOpen] = useState(false);

useEffect(() => {
 fetchTags();
}, [fetchTags]);

const handleTagClick = (tagId) => {
 if (selectedTags.includes(tagId)) {
 onChange(selectedTags.filter(id => id !== tagId));
 } else {
 onChange([...selectedTags, tagId]);
 }
};

return (
 <div className="relative">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="px-3 py-1 border rounded-md text-sm flex items-center"
 >
 <span>标签</span>
 <span className="ml-1">({selectedTags.length})</span>
 </button>

 {isOpen && (
 <div className="absolute z-10 mt-1 w-56 bg-white border rounded-md shadow-lg">
 <div className="p-2">
 {tags.map(tag => (
 <div
 key={tag.id}
 onClick={() => handleTagClick(tag.id)}
 className={`flex items-center p-2 cursor-pointer rounded-md ${
 selectedTags.includes(tag.id) ? 'bg-blue-50' : ''
 }`}
 >
 <span
 className="w-3 h-3 rounded-full mr-2"
 style={{ backgroundColor: tag.color }}
 />
 <span>{tag.name}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
);
};
```

---

## 8. 状态管理

### 8.1 Zustand存储设计

```typescript
// src/stores/index.ts
export * from './noteStore';
export * from './taskStore';
export * from './pomodoroStore';
export * from './projectStore';
export * from './tagStore';
export * from './settingsStore';
```

### 8.2 示例：项目状态管理
```typescript
// src/stores/projectStore.ts
import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/tauri';

interface Project {
id: string;
name: string;
description: string;
status: string;
created_at: string;
updated_at: string;
due_date?: string;
color: string;
}

interface KanbanColumn {
id: string;
project_id: string;
name: string;
position: number;
}

interface ProjectStore {
projects: Project[];
currentProject: Project | null;
columns: KanbanColumn[];
isLoading: boolean;
fetchProjects: () => Promise<void>;
fetchProjectColumns: (projectId: string) => Promise<void>;
createProject: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
updateProject: (id: string, data: Partial<Project>) => Promise<void>;
deleteProject: (id: string) => Promise<void>;
setCurrentProject: (project: Project | null) => void;
addColumn: (projectId: string, name: string) => Promise<void>;
updateColumn: (id: string, name: string) => Promise<void>;
deleteColumn: (id: string) => Promise<void>;
reorderColumns: (columnIds: string[]) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
projects: [],
currentProject: null,
columns: [],
isLoading: false,

fetchProjects: async () => {
 set({ isLoading: true });
 try {
 const projects = await invoke<Project[]>('get_all_projects');
 set({ projects, isLoading: false });
 } catch (error) {
 console.error('Failed to fetch projects:', error);
 set({ isLoading: false });
 }
},

fetchProjectColumns: async (projectId) => {
 try {
 const columns = await invoke<KanbanColumn[]>('get_project_columns', { projectId });
 set({ columns });
 } catch (error) {
 console.error('Failed to fetch project columns:', error);
 }
},

createProject: async (data) => {
 try {
 const newProject = await invoke<Project>('create_project', { ...data });
 set(state => ({
 projects: [...state.projects, newProject],
 currentProject: newProject
 }));
 } catch (error) {
 console.error('Failed to create project:', error);
 }
},

updateProject: async (id, data) => {
 try {
 await invoke('update_project', { id, ...data });
 set(state => ({
 projects: state.projects.map(project =>
 project.id === id ? { ...project, ...data, updated_at: new Date().toISOString() } : project
 ),
 currentProject: state.currentProject?.id === id
 ? { ...state.currentProject, ...data, updated_at: new Date().toISOString() }
 : state.currentProject
 }));
 } catch (error) {
 console.error('Failed to update project:', error);
 }
},

deleteProject: async (id) => {
 try {
 await invoke('delete_project', { id });
 set(state => ({
 projects: state.projects.filter(project => project.id !== id),
 currentProject: state.currentProject?.id === id ? null : state.currentProject,
 columns: state.currentProject?.id === id ? [] : state.columns
 }));
 } catch (error) {
 console.error('Failed to delete project:', error);
 }
},

setCurrentProject: (project) => {
 set({ currentProject: project });
 if (project) {
 get().fetchProjectColumns(project.id);
 }
},

addColumn: async (projectId, name) => {
 try {
 const newColumn = await invoke<KanbanColumn>('create_kanban_column', {
 projectId,
 name,
 position: get().columns.length
 });
 set(state => ({ columns: [...state.columns, newColumn] }));
 } catch (error) {
 console.error('Failed to add column:', error);
 }
},

updateColumn: async (id, name) => {
 try {
 await invoke('update_kanban_column', { id, name });
 set(state => ({
 columns: state.columns.map(col =>
 col.id === id ? { ...col, name } : col
 )
 }));
 } catch (error) {
 console.error('Failed to update column:', error);
 }
},

deleteColumn: async (id) => {
 try {
 await invoke('delete_kanban_column', { id });
 set(state => ({
 columns: state.columns.filter(col => col.id !== id)
 }));
 } catch (error) {
 console.error('Failed to delete column:', error);
 }
},

reorderColumns: async (columnIds) => {
 try {
 const updates = columnIds.map((id, index) => ({ id, position: index }));
 await invoke('reorder_kanban_columns', { updates });

 // 更新本地状态
 const reorderedColumns = [...get().columns];
 reorderedColumns.sort((a, b) => {
 return columnIds.indexOf(a.id) - columnIds.indexOf(b.id);
 });

 set({ columns: reorderedColumns });
 } catch (error) {
 console.error('Failed to reorder columns:', error);
 }
}
}));
```

---

## 9. API接口设计

### 9.1 Tauri命令接口

#### 9.1.1 笔记模块命令
```rust
// src-tauri/src/commands/notes.rs
use crate::models::Note;
use crate::db::DbConnection;
use tauri::State;

#[tauri::command]
pub fn get_all_notes(db: State<'_, DbConnection>) -> Result<Vec<Note>, String> {
 // 实现获取所有笔记的逻辑
}

#[tauri::command]
pub fn get_note_by_id(id: String, db: State<'_, DbConnection>) -> Result<Note, String> {
 // 实现通过ID获取笔记的逻辑
}

#[tauri::command]
pub fn create_note(title: String, content: String, db: State<'_, DbConnection>) -> Result<Note, String> {
 // 实现创建笔记的逻辑
}

#[tauri::command]
pub fn update_note(id: String, title: Option<String>, content: Option<String>, project_id: Option<String>, db: State<'_, DbConnection>) -> Result<(), String> {
 // 实现更新笔记的逻辑
}

#[tauri::command]
pub fn delete_note(id: String, db: State<'_, DbConnection>) -> Result<(), String> {
 // 实现删除笔记的逻辑
}

#[tauri::command]
pub fn search_notes(query: String, db: State<'_, DbConnection>) -> Result<Vec<Note>, String> {
 // 实现搜索笔记的逻辑
}

#[tauri::command]
pub fn get_notes_by_tag(tag_id: String, db: State<'_, DbConnection>) -> Result<Vec<Note>, String> {
 // 实现获取特定标签的笔记的逻辑
}
```

#### 9.1.2 注册命令
```rust
// src-tauri/src/main.rs
fn main() {
 tauri::Builder::default()
 .manage(DbConnection(Mutex::new(create_db_connection().unwrap())))
 .invoke_handler(tauri::generate_handler![
 // 笔记命令
 notes::get_all_notes,
 notes::get_note_by_id,
 notes::create_note,
 notes::update_note,
 notes::delete_note,
 notes::search_notes,
 notes::get_notes_by_tag,

 // 任务命令
 tasks::get_all_tasks,
 tasks::get_task_by_id,
 tasks::create_task,
 tasks::update_task,
 tasks::delete_task,
 tasks::get_tasks_by_project,
 tasks::complete_task,
 tasks::update_task_position,

 // 番茄钟命令
 pomodoro::create_pomodoro_session,
 pomodoro::update_pomodoro_session,
 pomodoro::get_pomodoro_history,
 pomodoro::complete_pomodoro_session,

 // 项目命令
 projects::get_all_projects,
 projects::get_project_by_id,
 projects::create_project,
 projects::update_project,
 projects::delete_project,
 projects::get_project_columns,
 projects::create_kanban_column,
 projects::update_kanban_column,
 projects::delete_kanban_column,
 projects::reorder_kanban_columns,

 // 标签命令
 tags::get_all_tags,
 tags::create_tag,
 tags::update_tag,
 tags::delete_tag,
 tags::add_tag_to_note,
 tags::remove_tag_from_note,

 // 系统命令
 system::send_notification,
 system::export_data,
 system::import_data,
 system::backup_database,
 system::restore_database
 ])
 .run(tauri::generate_context!())
 .expect("error while running tauri application");
}
```

---

## 10. 测试策略

### 10.1 前端测试
使用Vitest进行React组件和状态管理测试：

```typescript
// src/components/__tests__/NoteEditor.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MarkdownEditor } from '../notes/MarkdownEditor';

describe('MarkdownEditor', () => {
it('renders with initial value', () => {
 const onChangeMock = vi.fn();
 render(<MarkdownEditor value="# Test Note" onChange={onChangeMock} />);

 // CodeMirror实际上很难测试，这里主要检查组件是否渲染
 expect(screen.getByText(/Test Note/i)).toBeInTheDocument();
});

// 其他测试...
});
```

### 10.2 后端测试
使用Rust测试框架测试Rust后端逻辑：

```rust
// src-tauri/src/db/tests.rs
#[cfg(test)]
mod tests {
 use super::*;
 use rusqlite::Connection;
 use tempfile::tempdir;

 fn setup_test_db() -> Connection {
 let dir = tempdir().unwrap();
 let db_path = dir.path().join("test.db");
 let conn = Connection::open(db_path).unwrap();
 init_database(&conn).unwrap();
 conn
 }

 #[test]
 fn test_create_and_get_note() {
 let conn = setup_test_db();

 // 创建测试笔记
 let note = Note {
 id: "test-id".to_string(),
 title: "Test Note".to_string(),
 content: "Test Content".to_string(),
 created_at: "2023-01-01T00:00:00Z".to_string(),
 updated_at: "2023-01-01T00:00:00Z".to_string(),
 project_id: None,
 };

 // 插入笔记
 let sql = "INSERT INTO notes (id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
 conn.execute(
 sql,
 params![
 note.id,
 note.title,
 note.content,
 note.created_at,
 note.updated_at
 ],
 ).unwrap();

 // 获取笔记
 let sql = "SELECT id, title, content, created_at, updated_at, project_id FROM notes WHERE id = ?";
 let mut stmt = conn.prepare(sql).unwrap();
 let retrieved_note = stmt.query_row(params![note.id], |row| {
 Ok(Note {
 id: row.get(0)?,
 title: row.get(1)?,
 content: row.get(2)?,
 created_at: row.get(3)?,
 updated_at: row.get(4)?,
 project_id: row.get(5)?,
 })
 }).unwrap();

 assert_eq!(note.id, retrieved_note.id);
 assert_eq!(note.title, retrieved_note.title);
 assert_eq!(note.content, retrieved_note.content);
 }
}
```

---

## 11. 构建与部署

### 11.1 开发环境构建
```bash
# 启动开发环境
npm run tauri dev
```

### 11.2 生产环境构建
```bash
# 构建所有平台
npm run tauri build

# 构建特定平台
npm run tauri build -- --target windows
npm run tauri build -- --target macos
npm run tauri build -- --target linux
```

### 11.3 自动更新配置
```json
// src-tauri/tauri.conf.json
{
"updater": {
 "active": true,
 "endpoints": [
 "https://example.com/api/releases/{{target}}/{{current_version}}"
 ],
 "dialog": true,
 "pubkey": "your-public-key-here"
}
}
```

---

## 12. 开发规范

### 12.1 代码风格规范
- 使用ESLint和Prettier强制统一的代码风格
- 使用TypeScript类型系统确保类型安全
- 函数和组件使用JSDoc注释

### 12.2 提交规范
使用Conventional Commits规范提交信息：
- `feat`: 新功能
- `fix`: 修复Bug
- `docs`: 文档更新
- `style`: 样式更新
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统相关
- `ci`: CI配置相关
- `chore`: 其他更改

### 12.3 分支管理
- `main`: 主分支，保持稳定可发布状态
- `develop`: 开发分支，集成最新的开发成果
- `feature/*`: 功能分支，用于开发新功能
- `bugfix/*`: 问题修复分支
- `release/*`: 发布准备分支

---

## 13. 性能优化考量

### 13.1 前端性能优化
- 使用React.memo避免不必要的组件重渲染
- 使用虚拟列表渲染长列表(react-window)
- 数据查询使用防抖/节流处理
- 大型状态使用分片更新，避免整体刷新

### 13.2 数据库性能优化
- 为频繁查询的字段添加索引
- 使用事务进行批量操作
- 实现数据分页加载
- 考虑使用预编译SQL语句

### 13.3 应用启动优化
- 实现渐进式数据加载
- 使用异步初始化
- 优先加载UI，延迟加载非关键数据

---

## 14. 开发里程碑计划

### 14.1 阶段一: 基础架构与核心功能 (3周)
- 设置项目基础架构
- 实现数据库模型和基本CRUD操作
- 开发基本UI布局
- 实现笔记基础功能

### 14.2 阶段二: 扩展功能开发 (4周)
- 实现待办事项管理
- 开发番茄钟功能
- 添加项目管理基础功能
- 实现标签系统

### 14.3 阶段三: 高级功能与整合 (3周)
- 开发看板视图
- 实现时间线视图
- 功能间的数据关联
- 完善搜索功能

### 14.4 阶段四: 完善与优化 (2周)
- 性能优化
- 完善通知系统
- 实现数据导入/导出
- 添加数据备份/恢复

### 14.5 阶段五: 测试、构建与发布 (2周)
- 全面测试
- 修复问题
- 构建各平台安装包
- 准备发布资源

---

## 附录A: 项目依赖清单

### 前端依赖
```json
{
"dependencies": {
 "@tauri-apps/api": "^1.5.0",
 "react": "^18.2.0",
 "react-dom": "^18.2.0",
 "zustand": "^4.4.1",
 "react-markdown": "^8.0.7",
 "@uiw/react-codemirror": "^4.21.9",
 "@codemirror/lang-markdown": "^6.2.0",
 "@codemirror/language-data": "^6.3.1",
 "dayjs": "^1.11.9",
 "react-dnd": "^16.0.1",
 "react-dnd-html5-backend": "^16.0.1",
 "recharts": "^2.8.0",
 "react-hook-form": "^7.46.1",
 "zod": "^3.22.2",
 "@hookform/resolvers": "^3.3.1",
 "tailwindcss": "^3.3.3",
 "uuid": "^9.0.0",
 "nanoid": "^5.0.1"
},
"devDependencies": {
 "@tauri-apps/cli": "^1.5.0",
 "@types/react": "^18.2.15",
 "@types/react-dom": "^18.2.7",
 "@types/uuid": "^9.0.4",
 "@typescript-eslint/eslint-plugin": "^6.6.0",
 "@typescript-eslint/parser": "^6.6.0",
 "@vitejs/plugin-react": "^4.0.3",
 "autoprefixer": "^10.4.15",
 "eslint": "^8.45.0",
 "eslint-plugin-react-hooks": "^4.6.0",
 "eslint-plugin-react-refresh": "^0.4.3",
 "postcss": "^8.4.29",
 "typescript": "^5.0.2",
 "vite": "^4.4.9",
 "vitest": "^0.34.4",
 "@testing-library/react": "^14.0.0",
 "@testing-library/jest-dom": "^6.1.3"
}
}
```

### Rust依赖
```toml
# src-tauri/Cargo.toml
[dependencies]
tauri = { version = "1.5.0", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rusqlite = { version = "0.29.0", features = ["bundled"] }
r2d2 = "0.8.10"
r2d2_sqlite = "0.22.0"
uuid = { version = "1.4.1", features = ["v4", "serde"] }
chrono = { version = "0.4.31", features = ["serde"] }
tauri-plugin-sql = { git = "https://github.com/tauri-apps/plugins-workspace", branch = "v1" }
tauri-plugin-store = { git = "https://github.com/tauri-apps/plugins-workspace", branch = "v1" }
tauri-plugin-notification = { git = "https://github.com/tauri-apps/plugins-workspace", branch = "v1" }
```

## 附录B: 代码示例和模板

### B.1 状态管理钩子
```typescript
// src/hooks/useTaskActions.ts
import { useCallback } from 'react';
import { useTaskStore } from '../stores/taskStore';

export function useTaskActions() {
const {
 createTask,
 updateTask,
 deleteTask,
 completeTask,
 updateTaskPosition
} = useTaskStore();

const handleCreateTask = useCallback((title: string) => {
 return createTask({
 title,
 description: '',
 priority: 3,
 is_completed: false
 });
}, [createTask]);

const handleTaskDrop = useCallback((taskId: string, newPosition: number) => {
 updateTaskPosition(taskId, newPosition);
}, [updateTaskPosition]);

const handleTaskComplete = useCallback((taskId: string, isCompleted: boolean) => {
 completeTask(taskId, isCompleted);
}, [completeTask]);

return {
 handleCreateTask,
 handleTaskDrop,
 handleTaskComplete,
 updateTask,
 deleteTask
};
}
```
