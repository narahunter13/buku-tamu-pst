use tauri::Manager;
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn get_db_path(app: tauri::AppHandle) -> Result<String, String> {
	let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
	Ok(dir.join("buku-tamu.db").to_string_lossy().to_string())
}

#[tauri::command]
fn export_db(app: tauri::AppHandle, dest: String) -> Result<String, String> {
	let src = app
		.path()
		.app_data_dir()
		.map_err(|e| e.to_string())?
		.join("buku-tamu.db");
	if !src.exists() {
		return Err("Database belum ada (belum pernah dibuka di Tauri)".to_string());
	}
	std::fs::copy(&src, &dest).map_err(|e| e.to_string())?;
	Ok(dest)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec![Migration {
    version: 1,
    description: "create_visits",
    sql: include_str!("../migrations/001_visits.sql"),
    kind: MigrationKind::Up,
  }];

  tauri::Builder::default()
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:buku-tamu.db", migrations)
        .build(),
    )
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_autostart::Builder::new().build())
    .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
      if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_focus();
      }
    }))
    .invoke_handler(tauri::generate_handler![get_db_path, export_db])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
