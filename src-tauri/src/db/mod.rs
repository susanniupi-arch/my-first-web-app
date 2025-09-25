use rusqlite::{Connection, Result, params};
use r2d2::{Pool, PooledConnection};
use r2d2_sqlite::SqliteConnectionManager;
use std::sync::Mutex;
use anyhow::Error;

pub type DbPool = Pool<SqliteConnectionManager>;
pub type DbConnection = PooledConnection<SqliteConnectionManager>;

pub struct Database {
    pub pool: DbPool,
}

impl Database {
    pub fn new(database_url: &str) -> Result<Self, Error> {
        let manager = SqliteConnectionManager::file(database_url);
        let pool = Pool::new(manager)?;
        
        // 初始化数据库表
        let conn = pool.get()?;
        init_database(&conn)?;
        
        Ok(Database { pool })
    }

    pub fn get_connection(&self) -> Result<DbConnection, Error> {
        Ok(self.pool.get()?)
    }
}

pub fn init_database(conn: &Connection) -> Result<(), rusqlite::Error> {
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
            name TEXT NOT NULL UNIQUE,
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

    // 创建番茄钟会话表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id TEXT PRIMARY KEY,
            started_at TEXT NOT NULL,
            ended_at TEXT,
            duration INTEGER NOT NULL,
            is_completed INTEGER NOT NULL DEFAULT 0,
            task_id TEXT,
            notes TEXT,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
        )",
        [],
    )?;

    // 创建项目表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            due_date TEXT,
            color TEXT NOT NULL DEFAULT '#3b82f6'
        )",
        [],
    )?;

    // 创建看板列表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS kanban_columns (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            position INTEGER NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 创建任务-看板列关联表
    conn.execute(
        "CREATE TABLE IF NOT EXISTS column_tasks (
            task_id TEXT NOT NULL,
            column_id TEXT NOT NULL,
            position INTEGER NOT NULL,
            PRIMARY KEY (task_id, column_id),
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (column_id) REFERENCES kanban_columns(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // 创建索引以提高查询性能
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_project_id ON notes(project_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_pomodoro_task_id ON pomodoro_sessions(task_id)", [])?;
    conn.execute("CREATE INDEX IF NOT EXISTS idx_kanban_columns_project_id ON kanban_columns(project_id)", [])?;

    Ok(())
}