use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::{
    fs,
    io::{Read, Write},
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Mutex,
    },
};
use tauri::{
    AppHandle, Emitter, LogicalSize, Manager, PhysicalPosition, Position, Size, State,
    WebviewWindow, WindowEvent,
};
use zip::{write::SimpleFileOptions, ZipArchive, ZipWriter};

#[allow(dead_code)]
const BUILD_PROVENANCE: [u8; 7] = [0x41, 0x79, 0x6b, 0x6f, 0x6c, 0x69, 0x6e];

struct AppState {
    db: Mutex<Connection>,
    db_path: PathBuf,
    data_dir: PathBuf,
}

struct MascotRuntime {
    enabled: AtomicBool,
    hidden: AtomicBool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct JournalEntry {
    id: String,
    entry_date: String,
    title: String,
    content: String,
    mood: String,
    moon_phase: String,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Note {
    id: String,
    title: String,
    content: String,
    category: String,
    is_favorite: bool,
    created_at: String,
    updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct SearchResult {
    id: String,
    kind: String,
    title: String,
    excerpt: String,
    date: String,
    is_favorite: bool,
}

#[derive(Serialize, Deserialize)]
struct BackupManifest {
    format: String,
    format_version: u32,
    app_version: String,
    created_at: String,
    database_schema: u32,
    encrypted: bool,
}

fn open_database(path: &Path) -> Result<Connection, String> {
    let connection = Connection::open(path).map_err(|error| error.to_string())?;
    connection
        .execute_batch(
            "PRAGMA journal_mode = WAL;
             PRAGMA foreign_keys = ON;
             CREATE TABLE IF NOT EXISTS schema_migrations (
               version INTEGER PRIMARY KEY,
               applied_at TEXT NOT NULL
             );
             CREATE TABLE IF NOT EXISTS journal_entries (
               id TEXT PRIMARY KEY,
               entry_date TEXT NOT NULL,
               title TEXT NOT NULL DEFAULT '',
               content TEXT NOT NULL,
               mood TEXT NOT NULL DEFAULT '',
               moon_phase TEXT NOT NULL DEFAULT '',
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               deleted_at TEXT
             );
             CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date);
             CREATE TABLE IF NOT EXISTS notes (
               id TEXT PRIMARY KEY,
               title TEXT NOT NULL DEFAULT '',
               content TEXT NOT NULL DEFAULT '',
               category TEXT NOT NULL DEFAULT '',
               is_favorite INTEGER NOT NULL DEFAULT 0,
               created_at TEXT NOT NULL,
               updated_at TEXT NOT NULL,
               deleted_at TEXT
             );
             CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
             CREATE TABLE IF NOT EXISTS app_settings (
               key TEXT PRIMARY KEY,
               value TEXT NOT NULL,
               updated_at TEXT NOT NULL
             );
             INSERT OR IGNORE INTO schema_migrations(version, applied_at)
             VALUES (1, datetime('now'));",
        )
        .map_err(|error| error.to_string())?;
    Ok(connection)
}

fn mascot_enabled_from_database(connection: &Connection) -> bool {
    connection
        .query_row(
            "SELECT value FROM app_settings WHERE key='mascotEnabled'",
            [],
            |row| row.get::<_, String>(0),
        )
        .map(|value| value != "0")
        .unwrap_or(true)
}

fn position_mascot(window: &WebviewWindow, expanded: bool) -> Result<(), String> {
    let monitor = window
        .current_monitor()
        .map_err(|error| error.to_string())?
        .or_else(|| window.primary_monitor().ok().flatten())
        .ok_or_else(|| "Não foi possível localizar o monitor principal.".to_string())?;
    let scale = monitor.scale_factor();
    let (width, height, center_x, center_y) = if expanded {
        (360.0, 280.0, 180.0, 218.0)
    } else {
        (128.0, 128.0, 64.0, 64.0)
    };

    window
        .set_size(Size::Logical(LogicalSize::new(width, height)))
        .map_err(|error| error.to_string())?;

    let work_area = monitor.work_area();
    let anchor_x = work_area.position.x + work_area.size.width as i32 - (180.0 * scale) as i32;
    let anchor_y = work_area.position.y + work_area.size.height as i32 - (72.0 * scale) as i32;
    let left = anchor_x - (center_x * scale) as i32;
    let top = anchor_y - (center_y * scale) as i32;

    window
        .set_position(Position::Physical(PhysicalPosition::new(left, top)))
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn resize_mascot_around_anchor(window: &WebviewWindow, expanded: bool) -> Result<(), String> {
    let monitor = window
        .current_monitor()
        .map_err(|error| error.to_string())?
        .or_else(|| window.primary_monitor().ok().flatten())
        .ok_or_else(|| "Não foi possível localizar o monitor principal.".to_string())?;
    let scale = monitor.scale_factor();
    let current_size = window.outer_size().map_err(|error| error.to_string())?;
    let current_position = window.outer_position().map_err(|error| error.to_string())?;
    let was_expanded = current_size.width as f64 / scale > 200.0;
    let (old_center_x, old_center_y) = if was_expanded {
        (180.0, 218.0)
    } else {
        (64.0, 64.0)
    };
    let (width, height, center_x, center_y) = if expanded {
        (360.0, 280.0, 180.0, 218.0)
    } else {
        (128.0, 128.0, 64.0, 64.0)
    };

    let anchor_x = current_position.x + (old_center_x * scale).round() as i32;
    let anchor_y = current_position.y + (old_center_y * scale).round() as i32;
    let desired_left = anchor_x - (center_x * scale).round() as i32;
    let desired_top = anchor_y - (center_y * scale).round() as i32;
    let physical_width = (width * scale).round() as i32;
    let physical_height = (height * scale).round() as i32;
    let work_area = monitor.work_area();
    let min_left = work_area.position.x;
    let min_top = work_area.position.y;
    let max_left =
        (work_area.position.x + work_area.size.width as i32 - physical_width).max(min_left);
    let max_top =
        (work_area.position.y + work_area.size.height as i32 - physical_height).max(min_top);

    window
        .set_size(Size::Logical(LogicalSize::new(width, height)))
        .map_err(|error| error.to_string())?;
    window
        .set_position(Position::Physical(PhysicalPosition::new(
            desired_left.clamp(min_left, max_left),
            desired_top.clamp(min_top, max_top),
        )))
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn show_mascot(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("mascot")
        .ok_or_else(|| "A janela do mascote não está disponível.".to_string())?;
    if !window.is_visible().map_err(|error| error.to_string())? {
        position_mascot(&window, false)?;
    }
    window.show().map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn start_window_drag(window: WebviewWindow) -> Result<(), String> {
    window.start_dragging().map_err(|error| error.to_string())
}

#[tauri::command]
fn set_mascot_enabled(
    app: AppHandle,
    state: State<AppState>,
    mascot: State<MascotRuntime>,
    enabled: bool,
) -> Result<(), String> {
    {
        let connection = state.db.lock().map_err(|error| error.to_string())?;
        connection
            .execute(
                "INSERT INTO app_settings(key, value, updated_at) VALUES ('mascotEnabled', ?1, datetime('now'))
                 ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
                [if enabled { "1" } else { "0" }],
            )
            .map_err(|error| error.to_string())?;
    }

    mascot.enabled.store(enabled, Ordering::Relaxed);
    mascot.hidden.store(!enabled, Ordering::Relaxed);
    if enabled {
        show_mascot(&app)
    } else if let Some(window) = app.get_webview_window("mascot") {
        window.hide().map_err(|error| error.to_string())
    } else {
        Ok(())
    }
}

#[tauri::command]
fn set_mascot_expanded(app: AppHandle, expanded: bool) -> Result<(), String> {
    let window = app
        .get_webview_window("mascot")
        .ok_or_else(|| "A janela do mascote não está disponível.".to_string())?;
    resize_mascot_around_anchor(&window, expanded)
}

#[tauri::command]
fn open_main_window(app: AppHandle, screen: String) -> Result<(), String> {
    let allowed = [
        "home", "journal", "notes", "calendar", "memories", "backup", "settings",
    ];
    if !allowed.contains(&screen.as_str()) {
        return Err("A tela solicitada não existe.".into());
    }
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "A janela principal não está disponível.".to_string())?;
    window.show().map_err(|error| error.to_string())?;
    let _ = window.unminimize();
    window.set_focus().map_err(|error| error.to_string())?;
    window
        .emit("navigate", screen)
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn hide_mascot(app: AppHandle, mascot: State<MascotRuntime>) -> Result<(), String> {
    mascot.hidden.store(true, Ordering::Relaxed);
    if let Some(window) = app.get_webview_window("mascot") {
        window.hide().map_err(|error| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn quit_moon_dancer(app: AppHandle) {
    app.exit(0);
}

fn excerpt(value: &str) -> String {
    let compact = value.split_whitespace().collect::<Vec<_>>().join(" ");
    if compact.chars().count() > 125 {
        format!("{}...", compact.chars().take(122).collect::<String>())
    } else {
        compact
    }
}

#[tauri::command]
fn list_journal_entries(state: State<AppState>) -> Result<Vec<JournalEntry>, String> {
    let connection = state.db.lock().map_err(|error| error.to_string())?;
    let mut statement = connection
        .prepare(
            "SELECT id, entry_date, title, content, mood, moon_phase, created_at, updated_at
             FROM journal_entries WHERE deleted_at IS NULL ORDER BY entry_date DESC, updated_at DESC",
        )
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok(JournalEntry {
                id: row.get(0)?,
                entry_date: row.get(1)?,
                title: row.get(2)?,
                content: row.get(3)?,
                mood: row.get(4)?,
                moon_phase: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_journal_entry(state: State<AppState>, entry: JournalEntry) -> Result<JournalEntry, String> {
    if entry.id.trim().is_empty()
        || entry.entry_date.trim().is_empty()
        || entry.content.trim().is_empty()
    {
        return Err("O registro precisa de identificação, data e conteúdo.".into());
    }
    let connection = state.db.lock().map_err(|error| error.to_string())?;
    connection
        .execute(
            "INSERT INTO journal_entries(id, entry_date, title, content, mood, moon_phase, created_at, updated_at, deleted_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, NULL)
             ON CONFLICT(id) DO UPDATE SET entry_date=excluded.entry_date, title=excluded.title,
             content=excluded.content, mood=excluded.mood, moon_phase=excluded.moon_phase,
             updated_at=excluded.updated_at, deleted_at=NULL",
            params![entry.id, entry.entry_date, entry.title, entry.content, entry.mood, entry.moon_phase, entry.created_at, entry.updated_at],
        )
        .map_err(|error| error.to_string())?;
    Ok(entry)
}

#[tauri::command]
fn delete_journal_entry(state: State<AppState>, id: String) -> Result<(), String> {
    let connection = state.db.lock().map_err(|error| error.to_string())?;
    connection
        .execute(
            "UPDATE journal_entries SET deleted_at=datetime('now') WHERE id=?1",
            [id],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn list_notes(state: State<AppState>) -> Result<Vec<Note>, String> {
    let connection = state.db.lock().map_err(|error| error.to_string())?;
    let mut statement = connection
        .prepare(
            "SELECT id, title, content, category, is_favorite, created_at, updated_at
             FROM notes WHERE deleted_at IS NULL ORDER BY updated_at DESC",
        )
        .map_err(|error| error.to_string())?;
    let rows = statement
        .query_map([], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                category: row.get(3)?,
                is_favorite: row.get::<_, i64>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())
}

#[tauri::command]
fn save_note(state: State<AppState>, note: Note) -> Result<Note, String> {
    if note.id.trim().is_empty() {
        return Err("A nota precisa de identificação.".into());
    }
    let connection = state.db.lock().map_err(|error| error.to_string())?;
    connection
        .execute(
            "INSERT INTO notes(id, title, content, category, is_favorite, created_at, updated_at, deleted_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, NULL)
             ON CONFLICT(id) DO UPDATE SET title=excluded.title, content=excluded.content,
             category=excluded.category, is_favorite=excluded.is_favorite,
             updated_at=excluded.updated_at, deleted_at=NULL",
            params![note.id, note.title, note.content, note.category, note.is_favorite as i64, note.created_at, note.updated_at],
        )
        .map_err(|error| error.to_string())?;
    Ok(note)
}

#[tauri::command]
fn delete_note(state: State<AppState>, id: String) -> Result<(), String> {
    let connection = state.db.lock().map_err(|error| error.to_string())?;
    connection
        .execute(
            "UPDATE notes SET deleted_at=datetime('now') WHERE id=?1",
            [id],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

#[tauri::command]
fn search_entries(state: State<AppState>, query: String) -> Result<Vec<SearchResult>, String> {
    let term = format!("%{}%", query.trim());
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }
    let connection = state.db.lock().map_err(|error| error.to_string())?;
    let mut results = Vec::new();

    let mut journal = connection
        .prepare("SELECT id, title, content, entry_date FROM journal_entries WHERE deleted_at IS NULL AND (title LIKE ?1 OR content LIKE ?1) ORDER BY entry_date DESC")
        .map_err(|error| error.to_string())?;
    let journal_rows = journal
        .query_map([&term], |row| {
            let content: String = row.get(2)?;
            Ok(SearchResult {
                id: row.get(0)?,
                kind: "journal".into(),
                title: row.get::<_, String>(1)?,
                excerpt: excerpt(&content),
                date: row.get(3)?,
                is_favorite: false,
            })
        })
        .map_err(|error| error.to_string())?;
    for row in journal_rows {
        results.push(row.map_err(|error| error.to_string())?);
    }

    let mut notes = connection
        .prepare("SELECT id, title, content, substr(updated_at, 1, 10), is_favorite FROM notes WHERE deleted_at IS NULL AND (title LIKE ?1 OR content LIKE ?1) ORDER BY updated_at DESC")
        .map_err(|error| error.to_string())?;
    let note_rows = notes
        .query_map([&term], |row| {
            let content: String = row.get(2)?;
            Ok(SearchResult {
                id: row.get(0)?,
                kind: "note".into(),
                title: row.get::<_, String>(1)?,
                excerpt: excerpt(&content),
                date: row.get(3)?,
                is_favorite: row.get::<_, i64>(4)? != 0,
            })
        })
        .map_err(|error| error.to_string())?;
    for row in note_rows {
        results.push(row.map_err(|error| error.to_string())?);
    }
    results.sort_by(|a, b| b.date.cmp(&a.date));
    Ok(results)
}

#[tauri::command]
fn create_backup(state: State<AppState>, destination: String) -> Result<String, String> {
    if !destination.to_lowercase().ends_with(".moonbackup") {
        return Err("O backup precisa usar a extensão .moonbackup.".into());
    }
    {
        let connection = state.db.lock().map_err(|error| error.to_string())?;
        connection
            .execute_batch("PRAGMA wal_checkpoint(FULL);")
            .map_err(|error| error.to_string())?;
    }
    let manifest = BackupManifest {
        format: "moonbackup".into(),
        format_version: 1,
        app_version: env!("CARGO_PKG_VERSION").into(),
        created_at: chrono::Utc::now().to_rfc3339(),
        database_schema: 1,
        encrypted: false,
    };
    let target = PathBuf::from(&destination);
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let file = fs::File::create(&target).map_err(|error| error.to_string())?;
    let mut archive = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Deflated);
    archive
        .start_file("manifest.json", options)
        .map_err(|error| error.to_string())?;
    archive
        .write_all(
            serde_json::to_string_pretty(&manifest)
                .map_err(|error| error.to_string())?
                .as_bytes(),
        )
        .map_err(|error| error.to_string())?;
    archive
        .start_file("data/moon-dancer.sqlite", options)
        .map_err(|error| error.to_string())?;
    archive
        .write_all(&fs::read(&state.db_path).map_err(|error| error.to_string())?)
        .map_err(|error| error.to_string())?;
    archive.finish().map_err(|error| error.to_string())?;
    Ok(target.to_string_lossy().to_string())
}

#[tauri::command]
fn restore_backup(state: State<AppState>, source: String) -> Result<String, String> {
    if !source.to_lowercase().ends_with(".moonbackup") {
        return Err("Escolha um arquivo .moonbackup.".into());
    }
    let file = fs::File::open(&source).map_err(|error| error.to_string())?;
    let mut archive =
        ZipArchive::new(file).map_err(|_| "O arquivo de backup está corrompido.".to_string())?;
    let manifest: BackupManifest = {
        let mut entry = archive
            .by_name("manifest.json")
            .map_err(|_| "O backup não possui manifest.json.".to_string())?;
        let mut value = String::new();
        entry
            .read_to_string(&mut value)
            .map_err(|error| error.to_string())?;
        serde_json::from_str(&value).map_err(|_| "O manifesto do backup é inválido.".to_string())?
    };
    if manifest.format != "moonbackup" || manifest.format_version != 1 {
        return Err("Esta versão do backup ainda não é compatível.".into());
    }
    let temporary = state.data_dir.join("restore-candidate.sqlite");
    {
        let mut entry = archive
            .by_name("data/moon-dancer.sqlite")
            .map_err(|_| "O backup não possui banco de dados.".to_string())?;
        let mut output = fs::File::create(&temporary).map_err(|error| error.to_string())?;
        std::io::copy(&mut entry, &mut output).map_err(|error| error.to_string())?;
    }
    let candidate = Connection::open(&temporary)
        .map_err(|_| "O banco restaurado não pôde ser aberto.".to_string())?;
    let integrity: String = candidate
        .query_row("PRAGMA quick_check", [], |row| row.get(0))
        .map_err(|error| error.to_string())?;
    if integrity != "ok" {
        return Err("O banco do backup não passou pela verificação de integridade.".into());
    }
    drop(candidate);

    let snapshot = state.data_dir.join(format!(
        "pre-restore-{}.sqlite",
        chrono::Utc::now().format("%Y%m%d-%H%M%S")
    ));
    {
        let mut guard = state.db.lock().map_err(|error| error.to_string())?;
        guard
            .execute_batch("PRAGMA wal_checkpoint(FULL);")
            .map_err(|error| error.to_string())?;
        let placeholder = Connection::open_in_memory().map_err(|error| error.to_string())?;
        let previous = std::mem::replace(&mut *guard, placeholder);
        drop(previous);
        fs::copy(&state.db_path, &snapshot).map_err(|error| error.to_string())?;
        let wal_path = PathBuf::from(format!("{}-wal", state.db_path.to_string_lossy()));
        let shm_path = PathBuf::from(format!("{}-shm", state.db_path.to_string_lossy()));
        let _ = fs::remove_file(wal_path);
        let _ = fs::remove_file(shm_path);
        if let Err(error) = fs::copy(&temporary, &state.db_path) {
            let _ = fs::copy(&snapshot, &state.db_path);
            *guard = open_database(&state.db_path)?;
            return Err(error.to_string());
        }
        *guard = open_database(&state.db_path)?;
    }
    let _ = fs::remove_file(&temporary);
    Ok("Backup restaurado com segurança".into())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let data_dir = app
                .path()
                .app_data_dir()
                .map_err(|error| error.to_string())?;
            fs::create_dir_all(&data_dir)?;
            let db_path = data_dir.join("moon-dancer.sqlite");
            let connection = open_database(&db_path).map_err(std::io::Error::other)?;
            let mascot_enabled = mascot_enabled_from_database(&connection);
            app.manage(AppState {
                db: Mutex::new(connection),
                db_path,
                data_dir,
            });
            app.manage(MascotRuntime {
                enabled: AtomicBool::new(mascot_enabled),
                hidden: AtomicBool::new(!mascot_enabled),
            });
            if mascot_enabled {
                show_mascot(app.handle()).map_err(std::io::Error::other)?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    let app = window.app_handle();
                    let mascot = app.state::<MascotRuntime>();
                    if mascot.enabled.load(Ordering::Relaxed) {
                        api.prevent_close();
                        let _ = window.hide();
                        if !mascot.hidden.load(Ordering::Relaxed) {
                            let _ = show_mascot(app);
                        }
                    } else {
                        app.exit(0);
                    }
                } else if window.label() == "mascot" {
                    api.prevent_close();
                    let app = window.app_handle();
                    let mascot = app.state::<MascotRuntime>();
                    mascot.hidden.store(true, Ordering::Relaxed);
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            list_journal_entries,
            save_journal_entry,
            delete_journal_entry,
            list_notes,
            save_note,
            delete_note,
            search_entries,
            create_backup,
            restore_backup,
            set_mascot_enabled,
            set_mascot_expanded,
            start_window_drag,
            open_main_window,
            hide_mascot,
            quit_moon_dancer
        ])
        .run(tauri::generate_context!())
        .expect("não foi possível iniciar o Moon Dancer");
}
