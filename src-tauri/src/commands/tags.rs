use crate::models::Tag;
use crate::db::Database;
use tauri::State;
use rusqlite::params;
use chrono::{DateTime, Utc};
use uuid::Uuid;

#[tauri::command]
pub async fn get_all_tags(db: State<'_, Database>) -> Result<Vec<Tag>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT id, name, color, created_at
         FROM tags 
         ORDER BY name ASC"
    ).map_err(|e| e.to_string())?;
    
    let tag_iter = stmt.query_map([], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get::<_, String>(3)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(3, "created_at".to_string(), rusqlite::types::Type::Text))?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut tags = Vec::new();
    for tag in tag_iter {
        tags.push(tag.map_err(|e| e.to_string())?);
    }
    
    Ok(tags)
}

#[tauri::command]
pub async fn create_tag(
    name: String,
    color: Option<String>,
    db: State<'_, Database>
) -> Result<Tag, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now();
    let color = color.unwrap_or_else(|| "#6B7280".to_string());
    
    conn.execute(
        "INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)",
        params![id, name, color, now.to_rfc3339()]
    ).map_err(|e| e.to_string())?;
    
    Ok(Tag {
        id,
        name,
        color,
        created_at: now,
    })
}

#[tauri::command]
pub async fn update_tag(
    id: String,
    name: Option<String>,
    color: Option<String>,
    db: State<'_, Database>
) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut query_parts = Vec::new();
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    
    if let Some(name) = name {
        query_parts.push("name = ?");
        params_vec.push(Box::new(name));
    }
    
    if let Some(color) = color {
        query_parts.push("color = ?");
        params_vec.push(Box::new(color));
    }
    
    if query_parts.is_empty() {
        return Ok(());
    }
    
    params_vec.push(Box::new(id));
    
    let query = format!(
        "UPDATE tags SET {} WHERE id = ?",
        query_parts.join(", ")
    );
    
    conn.execute(&query, rusqlite::params_from_iter(params_vec.iter().map(|p| p.as_ref())))
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn delete_tag(id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    // 删除标签与笔记的关联
    conn.execute("DELETE FROM note_tags WHERE tag_id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    // 删除标签
    conn.execute("DELETE FROM tags WHERE id = ?", params![id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn add_tag_to_note(note_id: String, tag_id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    conn.execute(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
        params![note_id, tag_id]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn remove_tag_from_note(note_id: String, tag_id: String, db: State<'_, Database>) -> Result<(), String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    conn.execute(
        "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?",
        params![note_id, tag_id]
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_tags_for_note(note_id: String, db: State<'_, Database>) -> Result<Vec<Tag>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT t.id, t.name, t.color, t.created_at
         FROM tags t
         INNER JOIN note_tags nt ON t.id = nt.tag_id
         WHERE nt.note_id = ?
         ORDER BY t.name ASC"
    ).map_err(|e| e.to_string())?;
    
    let tag_iter = stmt.query_map(params![note_id], |row| {
        Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get::<_, String>(3)?.parse().map_err(|_| rusqlite::Error::InvalidColumnType(3, "created_at".to_string(), rusqlite::types::Type::Text))?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut tags = Vec::new();
    for tag in tag_iter {
        tags.push(tag.map_err(|e| e.to_string())?);
    }
    
    Ok(tags)
}

#[tauri::command]
pub async fn get_notes_by_tag(tag_id: String, db: State<'_, Database>) -> Result<Vec<String>, String> {
    let conn = db.get_connection().map_err(|e| e.to_string())?;
    
    let mut stmt = conn.prepare(
        "SELECT note_id FROM note_tags WHERE tag_id = ?"
    ).map_err(|e| e.to_string())?;
    
    let note_id_iter = stmt.query_map(params![tag_id], |row| {
        Ok(row.get::<_, String>(0)?)
    }).map_err(|e| e.to_string())?;
    
    let mut note_ids = Vec::new();
    for note_id in note_id_iter {
        note_ids.push(note_id.map_err(|e| e.to_string())?);
    }
    
    Ok(note_ids)
}