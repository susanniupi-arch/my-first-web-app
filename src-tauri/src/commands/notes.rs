use crate::models::Note;
use crate::db::Database;
use tauri::State;
use rusqlite::params;
use chrono::Utc;
use uuid::Uuid;

#[tauri::command]
pub async fn get_all_notes(db: State<'_, Database>) -> Result<Vec<Note>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, project_id 
         FROM notes 
         ORDER BY updated_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let note_iter = stmt.query_map([], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get::<_, String>(3)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(3, "created_at".to_string(), rusqlite::types::Type::Text))?,
            updated_at: row.get::<_, String>(4)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(4, "updated_at".to_string(), rusqlite::types::Type::Text))?,
            project_id: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut notes = Vec::new();
    for note in note_iter {
        notes.push(note.map_err(|e| e.to_string())?);
    }
    
    Ok(notes)
}

#[tauri::command]
pub async fn get_note_by_id(id: String, db: State<'_, Database>) -> Result<Note, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, project_id 
         FROM notes 
         WHERE id = ?"
    ).map_err(|e| e.to_string())?;
    
    let note = stmt.query_row(params![id], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get::<_, String>(3)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(3, "created_at".to_string(), rusqlite::types::Type::Text))?,
            updated_at: row.get::<_, String>(4)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(4, "updated_at".to_string(), rusqlite::types::Type::Text))?,
            project_id: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    Ok(note)
}

#[tauri::command]
pub async fn create_note(title: String, content: String, project_id: Option<String>, db: State<'_, Database>) -> Result<Note, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    conn.execute(
        "INSERT INTO notes (id, title, content, created_at, updated_at, project_id) 
         VALUES (?, ?, ?, ?, ?, ?)",
        params![id, title, content, now.to_rfc3339(), now.to_rfc3339(), project_id]
    ).map_err(|e| e.to_string())?;
    
    Ok(Note {
        id,
        title,
        content,
        created_at: now,
        updated_at: now,
        project_id,
    })
}

#[tauri::command]
pub async fn update_note(
    id: String, 
    title: Option<String>, 
    content: Option<String>, 
    project_id: Option<String>,
    db: State<'_, Database>
) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    let now = Utc::now();
    
    let mut query_parts = Vec::new();
    let mut params_vec = Vec::new();
    
    if let Some(title) = title {
        query_parts.push("title = ?");
        params_vec.push(title);
    }
    
    if let Some(content) = content {
        query_parts.push("content = ?");
        params_vec.push(content);
    }
    
    if let Some(project_id) = project_id {
        query_parts.push("project_id = ?");
        params_vec.push(project_id);
    }
    
    query_parts.push("updated_at = ?");
    params_vec.push(now.to_rfc3339());
    params_vec.push(id);
    
    let query = format!(
        "UPDATE notes SET {} WHERE id = ?",
        query_parts.join(", ")
    );
    
    conn.execute(&query, rusqlite::params_from_iter(params_vec))
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_note(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    conn.execute("DELETE FROM notes WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn search_notes(query: String, db: State<'_, Database>) -> Result<Vec<Note>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let search_pattern = format!("%{}%", query);
    
    let mut stmt = conn.prepare(
        "SELECT id, title, content, created_at, updated_at, project_id 
         FROM notes 
         WHERE title LIKE ? OR content LIKE ?
         ORDER BY updated_at DESC"
    ).map_err(|e| e.to_string())?;
    
    let note_iter = stmt.query_map(params![search_pattern, search_pattern], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            created_at: row.get::<_, String>(3)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(3, "created_at".to_string(), rusqlite::types::Type::Text))?,
            updated_at: row.get::<_, String>(4)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(4, "updated_at".to_string(), rusqlite::types::Type::Text))?,
            project_id: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut notes = Vec::new();
    for note in note_iter {
        notes.push(note.map_err(|e| e.to_string())?);
    }
    
    Ok(notes)
}