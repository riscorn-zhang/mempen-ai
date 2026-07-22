use std::fs::{self, File};
use std::io::{BufReader, BufWriter, Read, Write};
use std::path::PathBuf;
use tauri::Manager;

/// Resolve `filepath` relative to the app data dir, creating parent dirs as needed.
fn resolve_path(app: &tauri::AppHandle, filepath: &str) -> Result<PathBuf, String> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("failed to get app data dir: {e}"))?;
    let full = base.join(filepath);
    if let Some(parent) = full.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("failed to create dirs: {e}"))?;
    }
    Ok(full)
}

/// Stream-read file contents as UTF-8 text.
#[tauri::command]
pub fn load_data(app: tauri::AppHandle, filepath: String) -> Result<String, String> {
    let path = resolve_path(&app, &filepath)?;
    if !path.exists() {
        return Ok(String::new());
    }
    let file = File::open(&path).map_err(|e| format!("failed to open: {e}"))?;
    let mut reader = BufReader::new(file);
    let mut content = String::new();
    reader
        .read_to_string(&mut content)
        .map_err(|e| format!("failed to read: {e}"))?;
    Ok(content)
}

/// Stream-write UTF-8 text to file.
#[tauri::command]
pub fn save_data(app: tauri::AppHandle, filepath: String, data: String) -> Result<(), String> {
    let path = resolve_path(&app, &filepath)?;
    let file = File::create(&path).map_err(|e| format!("failed to create: {e}"))?;
    let mut writer = BufWriter::new(file);
    writer
        .write_all(data.as_bytes())
        .map_err(|e| format!("failed to write: {e}"))?;
    writer
        .flush()
        .map_err(|e| format!("failed to flush: {e}"))?;
    Ok(())
}
