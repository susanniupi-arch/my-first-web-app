mod db;
mod models;
mod commands;

use db::Database;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // 初始化数据库
      let database = Database::new().expect("Failed to initialize database");
      app.manage(database);
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      // 笔记相关命令
      commands::get_all_notes,
      commands::get_note_by_id,
      commands::create_note,
      commands::update_note,
      commands::delete_note,
      commands::search_notes,
      
      // 任务相关命令
      commands::get_all_tasks,
      commands::create_task,
      commands::update_task,
      commands::delete_task,
      commands::update_task_position,
      commands::get_tasks_by_project,
      
      // 番茄钟相关命令
      commands::get_all_pomodoro_sessions,
      commands::start_pomodoro_session,
      commands::complete_pomodoro_session,
      commands::cancel_pomodoro_session,
      commands::get_pomodoro_stats,
      commands::get_sessions_by_task,
      
      // 项目相关命令
      commands::get_all_projects,
      commands::get_project_by_id,
      commands::create_project,
      commands::update_project,
      commands::delete_project,
      commands::get_project_stats,
      commands::archive_project,
      commands::unarchive_project,
      
      // 标签相关命令
      commands::get_all_tags,
      commands::create_tag,
      commands::update_tag,
      commands::delete_tag,
      commands::add_tag_to_note,
      commands::remove_tag_from_note,
      commands::get_tags_for_note,
      commands::get_notes_by_tag,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
