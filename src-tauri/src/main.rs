// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;

#[tauri::command]
fn create_cron_job(schedule: String, command: String) -> Result<String, String> {
    // Get existing crontab
    let existing_crontab = Command::new("crontab")
        .arg("-l")
        .output()
        .map_err(|e| e.to_string())?;

    let mut crontab_content = String::from_utf8_lossy(&existing_crontab.stdout).to_string();
    
    // Add new cron job
    let new_job = format!("{} {}\n", schedule, command);
    crontab_content.push_str(&new_job);

    // Create a temporary file
    let temp_file = std::env::temp_dir().join("temp_crontab");
    std::fs::write(&temp_file, crontab_content).map_err(|e| e.to_string())?;

    // Install new crontab
    let status = Command::new("crontab")
        .arg(temp_file.to_str().unwrap())
        .status()
        .map_err(|e| e.to_string())?;

    if status.success() {
        Ok("Cron job created successfully".to_string())
    } else {
        Err("Failed to create cron job".to_string())
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![create_cron_job])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
