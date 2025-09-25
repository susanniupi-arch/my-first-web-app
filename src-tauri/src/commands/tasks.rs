use crate::models::Task;
use crate::db::Database;
use tauri::State;
use rusqlite::params;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[tauri::command]
pub async fn get_all_tasks(db: State<'_, Database>) -> Result<Vec<Task>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, title, description, is_completed, priority, due_date, remind_at, 
                created_at, updated_at, project_id, parent_id, position
         FROM tasks 
         ORDER BY position ASC, created_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let task_iter = stmt.query_map([], |row| {
        Ok(Task {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            is_completed: row.get::<_, i32>(3)? != 0,
            priority: row.get(4)?,
            due_date: row.get::<_, Option<String>>(5)?.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(5, "due_date".to_string(), rusqlite::types::Type::Text))?,
            remind_at: row.get::<_, Option<String>>(6)?.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(6, "remind_at".to_string(), rusqlite::types::Type::Text))?,
            created_at: row.get::<_, String>(7)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(7, "created_at".to_string(), rusqlite::types::Type::Text))?,
            updated_at: row.get::<_, String>(8)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(8, "updated_at".to_string(), rusqlite::types::Type::Text))?,
            project_id: row.get(9)?,
            parent_id: row.get(10)?,
            position: row.get(11)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut tasks = Vec::new();
    for task in task_iter {
        tasks.push(task.map_err(|e| e.to_string())?);
    }
    
    Ok(tasks)
}

#[tauri::command]
pub async fn create_task(
    title: String,
    description: Option<String>,
    priority: Option<i32>,
    due_date: Option<String>,
    project_id: Option<String>,
    parent_id: Option<String>,
    db: State<'_, Database>
) -> Result<Task, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let priority = priority.unwrap_or(3);
    
    // 获取下一个位置
    let position: i32 = conn.query_row(
        "SELECT COALESCE(MAX(position), 0) + 1 FROM tasks WHERE parent_id IS ?",
        params![parent_id],
        |row| row.get(0)
    ).unwrap_or(1);
    
    let due_date_parsed: Option<DateTime<Utc>> = if let Some(date_str) = &due_date {
        Some(date_str.parse().map_err(|_| "Invalid due_date format")?)
    } else {
        None
    };
    
    conn.execute(
        "INSERT INTO tasks (id, title, description, is_completed, priority, due_date, remind_at, 
                           created_at, updated_at, project_id, parent_id, position) 
         VALUES (?, ?, ?, 0, ?, ?, NULL, ?, ?, ?, ?, ?)",
        params![
            id, title, description, priority, 
            due_date_parsed.map(|d| d.to_rfc3339()),
            now.to_rfc3339(), now.to_rfc3339(), 
            project_id, parent_id, position
        ]
    ).map_err(|e| e.to_string())?;
    
    Ok(Task {
        id,
        title,
        description,
        is_completed: false,
        priority,
        due_date: due_date_parsed,
        remind_at: None,
        created_at: now,
        updated_at: now,
        project_id,
        parent_id,
        position,
    })
}

#[tauri::command]
pub async fn update_task(
    id: String,
    title: Option<String>,
    description: Option<String>,
    is_completed: Option<bool>,
    priority: Option<i32>,
    due_date: Option<String>,
    project_id: Option<String>,
    db: State<'_, Database>
) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now();
    
    let mut query_parts = Vec::new();
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(title) = title {
        query_parts.push("title = ?");
        params_vec.push(Box::new(title));
    }
    
    if let Some(description) = description {
        query_parts.push("description = ?");
        params_vec.push(Box::new(description));
    }
    
    if let Some(is_completed) = is_completed {
        query_parts.push("is_completed = ?");
        params_vec.push(Box::new(if is_completed { 1 } else { 0 }));
    }
    
    if let Some(priority) = priority {
        query_parts.push("priority = ?");
        params_vec.push(Box::new(priority));
    }
    
    if let Some(due_date) = due_date {
        query_parts.push("due_date = ?");
        let due_date_parsed: Option<DateTime<Utc>> = if due_date.is_empty() {
            None
        } else {
            Some(due_date.parse().map_err(|_| "Invalid due_date format")?)
        };
        params_vec.push(Box::new(due_date_parsed.map(|d| d.to_rfc3339())));
    }
    
    if let Some(project_id) = project_id {
        query_parts.push("project_id = ?");
        params_vec.push(Box::new(project_id));
    }
    
    query_parts.push("updated_at = ?");
    params_vec.push(Box::new(now.to_rfc3339()));
    params_vec.push(Box::new(id));
    
    let query = format!(
        "UPDATE tasks SET {} WHERE id = ?",
        query_parts.join(", ")
    );
    
    conn.execute(&query, rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())))
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_task(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM tasks WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn update_task_position(id: String, new_position: i32, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now();
    
    conn.execute(
        "UPDATE tasks SET position = ?, updated_at = ? WHERE id = ?",
        params![new_position, now.to_rfc3339(), id]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_tasks_by_project(project_id: String, db: State<'_, Database>) -> Result<Vec<Task>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, title, description, is_completed, priority, due_date, remind_at, 
                created_at, updated_at, project_id, parent_id, position
         FROM tasks 
         WHERE project_id = ?
         ORDER BY position ASC, created_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let task_iter = stmt.query_map(params![project_id], |row| {
        Ok(Task {
            id: row.get(0)?,
            title: row.get(1)?,
            description: row.get(2)?,
            is_completed: row.get::<_, i32>(3)? != 0,
            priority: row.get(4)?,
            due_date: row.get::<_, Option<String>>(5)?.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(5, "due_date".to_string(), rusqlite::types::Type::Text))?,
            remind_at: row.get::<_, Option<String>>(6)?.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(6, "remind_at".to_string(), rusqlite::types::Type::Text))?,
            created_at: row.get::<_, String>(7)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(7, "created_at".to_string(), rusqlite::types::Type::Text))?,
            updated_at: row.get::<_, String>(8)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(8, "updated_at".to_string(), rusqlite::types::Type::Text))?,
            project_id: row.get(9)?,
            parent_id: row.get(10)?,
            position: row.get(11)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut tasks = Vec::new();
    for task in task_iter {
        tasks.push(task.map_err(|e| e.to_string())?);
    }
    
    Ok(tasks)
}