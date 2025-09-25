use crate::models::PomodoroSession;
use crate::db::Database;
use tauri::State;
use rusqlite::params;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[tauri::command]
pub async fn get_all_pomodoro_sessions(db: State<'_, Database>) -> Result<Vec<PomodoroSession>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, task_id, duration_minutes, is_completed, started_at, completed_at, created_at
         FROM pomodoro_sessions 
         ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let session_iter = stmt.query_map([], |row| {
        Ok(PomodoroSession {
            id: row.get(0)?,
            task_id: row.get(1)?,
            duration_minutes: row.get(2)?,
            is_completed: row.get::<_, i32>(3)? != 0,
            started_at: row.get::<_, String>(4)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(4, "started_at".to_string(), rusqlite::types::Type::Text))?,
            completed_at: row.get::<_, Option<String>>(5)?.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(5, "completed_at".to_string(), rusqlite::types::Type::Text))?,
            created_at: row.get::<_, String>(6)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(6, "created_at".to_string(), rusqlite::types::Type::Text))?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut sessions = Vec::new();
    for session in session_iter {
        sessions.push(session.map_err(|e| e.to_string())?);
    }
    
    Ok(sessions)
}

#[tauri::command]
pub async fn start_pomodoro_session(
    task_id: Option<String>,
    duration_minutes: i32,
    db: State<'_, Database>
) -> Result<PomodoroSession, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    conn.execute(
        "INSERT INTO pomodoro_sessions (id, task_id, duration_minutes, is_completed, started_at, completed_at, created_at) 
         VALUES (?, ?, ?, 0, ?, NULL, ?)",
        params![id, task_id, duration_minutes, now.to_rfc3339(), now.to_rfc3339()]
    ).map_err(|e| e.to_string())?;
    
    Ok(PomodoroSession {
        id,
        task_id,
        duration_minutes,
        is_completed: false,
        started_at: now,
        completed_at: None,
        created_at: now,
    })
}

#[tauri::command]
pub async fn complete_pomodoro_session(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now();
    
    conn.execute(
        "UPDATE pomodoro_sessions SET is_completed = 1, completed_at = ? WHERE id = ?",
        params![now.to_rfc3339(), id]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn cancel_pomodoro_session(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM pomodoro_sessions WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_pomodoro_stats(
    start_date: Option<String>,
    end_date: Option<String>,
    db: State<'_, Database>
) -> Result<serde_json::Value, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut query = "SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed_sessions,
        SUM(CASE WHEN is_completed = 1 THEN duration_minutes ELSE 0 END) as total_minutes,
        AVG(CASE WHEN is_completed = 1 THEN duration_minutes ELSE NULL END) as avg_duration
        FROM pomodoro_sessions WHERE 1=1".to_string();
    
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(start_date) = start_date {
        query.push_str(" AND created_at >= ?");
        params_vec.push(Box::new(start_date));
    }
    
    if let Some(end_date) = end_date {
        query.push_str(" AND created_at <= ?");
        params_vec.push(Box::new(end_date));
    }
    
    let stats = conn.query_row(
        &query,
        rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())),
        |row| {
            Ok(serde_json::json!({
                "total_sessions": row.get::<_, i32>(0)?,
                "completed_sessions": row.get::<_, i32>(1)?,
                "total_minutes": row.get::<_, i32>(2)?,
                "avg_duration": row.get::<_, Option<f64>>(3)?
            }))
        }
    ).map_err(|e| e.to_string())?;
    
    Ok(stats)
}

#[tauri::command]
pub async fn get_sessions_by_task(task_id: String, db: State<'_, Database>) -> Result<Vec<PomodoroSession>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, task_id, duration_minutes, is_completed, started_at, completed_at, created_at
         FROM pomodoro_sessions 
         WHERE task_id = ?
         ORDER BY created_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let session_iter = stmt.query_map(params![task_id], |row| {
        Ok(PomodoroSession {
            id: row.get(0)?,
            task_id: row.get(1)?,
            duration_minutes: row.get(2)?,
            is_completed: row.get::<_, i32>(3)? != 0,
            started_at: row.get::<_, String>(4)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(4, "started_at".to_string(), rusqlite::types::Type::Text))?,
            completed_at: row.get::<_, Option<String>>(5)?.map(|s| s.parse()).transpose().map_err(|_| rusqlite::Error::InvalidColumnType(5, "completed_at".to_string(), rusqlite::types::Type::Text))?,
            created_at: row.get::<_, String>(6)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(6, "created_at".to_string(), rusqlite::types::Type::Text))?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut sessions = Vec::new();
    for session in session_iter {
        sessions.push(session.map_err(|e| e.to_string())?);
    }
    
    Ok(sessions)
}