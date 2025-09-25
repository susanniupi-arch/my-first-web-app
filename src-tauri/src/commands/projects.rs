use crate::models::Project;
use crate::db::Database;
use tauri::State;
use rusqlite::params;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[tauri::command]
pub async fn get_all_projects(db: State<'_, Database>) -> Result<Vec<Project>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, description, color, is_archived, created_at, updated_at
         FROM projects 
         ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let project_iter = stmt.query_map([], |row| {
        Ok(Project {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
            color: row.get(3)?,
            is_archived: row.get::<_, i32>(4)? != 0,
            created_at: row.get::<_, String>(5)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(5, "created_at".to_string(), rusqlite::types::Type::Text))?,
            updated_at: row.get::<_, String>(6)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(6, "updated_at".to_string(), rusqlite::types::Type::Text))?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut projects = Vec::new();
    for project in project_iter {
        projects.push(project.map_err(|e| e.to_string())?);
    }
    
    Ok(projects)
}

#[tauri::command]
pub async fn get_project_by_id(id: String, db: State<'_, Database>) -> Result<Option<Project>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let result = conn.query_row(
        "SELECT id, name, description, color, is_archived, created_at, updated_at
         FROM projects WHERE id = ?",
        params![id],
        |row| {
            Ok(Project {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                color: row.get(3)?,
                is_archived: row.get::<_, i32>(4)? != 0,
                created_at: row.get::<_, String>(5)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(5, "created_at".to_string(), rusqlite::types::Type::Text))?,
                updated_at: row.get::<_, String>(6)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(6, "updated_at".to_string(), rusqlite::types::Type::Text))?,
            })
        }
    );
    
    match result {
        Ok(project) => Ok(Some(project)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub async fn create_project(
    name: String,
    description: Option<String>,
    color: Option<String>,
    db: State<'_, Database>
) -> Result<Project, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let color = color.unwrap_or_else(|| "#3B82F6".to_string());
    
    conn.execute(
        "INSERT INTO projects (id, name, description, color, is_archived, created_at, updated_at) 
         VALUES (?, ?, ?, ?, 0, ?, ?)",
        params![id, name, description, color, now.to_rfc3339(), now.to_rfc3339()]
    ).map_err(|e| e.to_string())?;
    
    Ok(Project {
        id,
        name,
        description,
        color,
        is_archived: false,
        created_at: now,
        updated_at: now,
    })
}

#[tauri::command]
pub async fn update_project(
    id: String,
    name: Option<String>,
    description: Option<String>,
    color: Option<String>,
    is_archived: Option<bool>,
    db: State<'_, Database>
) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now();
    
    let mut query_parts = Vec::new();
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(name) = name {
        query_parts.push("name = ?");
        params_vec.push(Box::new(name));
    }
    
    if let Some(description) = description {
        query_parts.push("description = ?");
        params_vec.push(Box::new(description));
    }
    
    if let Some(color) = color {
        query_parts.push("color = ?");
        params_vec.push(Box::new(color));
    }
    
    if let Some(is_archived) = is_archived {
        query_parts.push("is_archived = ?");
        params_vec.push(Box::new(if is_archived { 1 } else { 0 }));
    }
    
    query_parts.push("updated_at = ?");
    params_vec.push(Box::new(now.to_rfc3339()));
    params_vec.push(Box::new(id));
    
    let query = format!(
        "UPDATE projects SET {} WHERE id = ?",
        query_parts.join(", ")
    );
    
    conn.execute(&query, rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())))
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_project(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    // 删除项目相关的任务
    conn.execute("DELETE FROM tasks WHERE project_id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    // 删除项目
    conn.execute("DELETE FROM projects WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_project_stats(id: String, db: State<'_, Database>) -> Result<serde_json::Value, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let stats = conn.query_row(
        "SELECT 
            COUNT(*) as total_tasks,
            COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed_tasks,
            COUNT(CASE WHEN is_completed = 0 THEN 1 END) as pending_tasks
         FROM tasks WHERE project_id = ?",
        params![id],
        |row| {
            Ok(serde_json::json!({
                "total_tasks": row.get::<_, i32>(0)?,
                "completed_tasks": row.get::<_, i32>(1)?,
                "pending_tasks": row.get::<_, i32>(2)?
            }))
        }
    ).map_err(|e| e.to_string())?;
    
    Ok(stats)
}

#[tauri::command]
pub async fn archive_project(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now();
    
    conn.execute(
        "UPDATE projects SET is_archived = 1, updated_at = ? WHERE id = ?",
        params![now.to_rfc3339(), id]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn unarchive_project(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now();
    
    conn.execute(
        "UPDATE projects SET is_archived = 0, updated_at = ? WHERE id = ?",
        params![now.to_rfc3339(), id]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}