// 하루 데스크톱 — Tauri 2.0 진입점.
//
// 디자인:
//   - 웹앱(packages/web)을 그대로 호스팅 webview 로 표시. 데스크톱 전용
//     UI 를 따로 만들지 않고 single source of truth 유지.
//   - 시스템 트레이: 좌클릭 = 메인 창 토글, 우클릭 = 메뉴
//   - 글로벌 메뉴 (macOS 상단 바, Win/Linux 윈도 메뉴): 빠른 추가, 동기화,
//     설정으로 이동.
//   - Deep link (haru://...): URL scheme 등록 → mobile 과 같은 형식으로
//     브라우저나 다른 앱에서 task 추가 가능.
//   - Native notifications: tauri-plugin-notification 통해 OS 알림 발송.
//     향후 백엔드 푸시를 받아 데스크톱 알림 띄울 수 있도록 SSE 연결 예정.

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Emitter, Manager, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            build_menu(app)?;
            build_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // macOS: 창 닫기 = 숨김. 트레이로 살아있게 한다.
            #[cfg(target_os = "macos")]
            if let WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
            #[cfg(not(target_os = "macos"))]
            let _ = (window, event);
        })
        .invoke_handler(tauri::generate_handler![
            quick_add_command,
            sync_now_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn build_menu(app: &mut tauri::App) -> tauri::Result<()> {
    let handle = app.handle();

    // App > [About 하루, Quit]
    let app_submenu = Submenu::with_items(
        handle,
        "하루",
        true,
        &[
            &PredefinedMenuItem::about(handle, Some("하루 정보"), Default::default())?,
            &PredefinedMenuItem::separator(handle)?,
            &PredefinedMenuItem::services(handle, Some("서비스"))?,
            &PredefinedMenuItem::separator(handle)?,
            &PredefinedMenuItem::hide(handle, Some("숨기기"))?,
            &PredefinedMenuItem::hide_others(handle, Some("기타 숨기기"))?,
            &PredefinedMenuItem::show_all(handle, Some("모두 표시"))?,
            &PredefinedMenuItem::separator(handle)?,
            &PredefinedMenuItem::quit(handle, Some("하루 종료"))?,
        ],
    )?;

    // 파일 > [빠른 추가, 동기화]
    let file_submenu = Submenu::with_items(
        handle,
        "파일",
        true,
        &[
            &MenuItem::with_id(handle, "quick-add", "빠른 추가...", true, Some("Cmd+N"))?,
            &MenuItem::with_id(handle, "sync-now", "지금 동기화", true, Some("Cmd+R"))?,
        ],
    )?;

    // 편집 (표준)
    let edit_submenu = Submenu::with_items(
        handle,
        "편집",
        true,
        &[
            &PredefinedMenuItem::undo(handle, Some("실행 취소"))?,
            &PredefinedMenuItem::redo(handle, Some("다시 실행"))?,
            &PredefinedMenuItem::separator(handle)?,
            &PredefinedMenuItem::cut(handle, Some("잘라내기"))?,
            &PredefinedMenuItem::copy(handle, Some("복사"))?,
            &PredefinedMenuItem::paste(handle, Some("붙여넣기"))?,
            &PredefinedMenuItem::select_all(handle, Some("모두 선택"))?,
        ],
    )?;

    // 보기 > [4단 뷰 단축키]
    let view_submenu = Submenu::with_items(
        handle,
        "보기",
        true,
        &[
            &MenuItem::with_id(handle, "view-today", "오늘", true, Some("Cmd+1"))?,
            &MenuItem::with_id(handle, "view-this-week", "이번주", true, Some("Cmd+2"))?,
            &MenuItem::with_id(handle, "view-upcoming", "예정", true, Some("Cmd+3"))?,
            &MenuItem::with_id(handle, "view-anytime", "언제든지", true, Some("Cmd+4"))?,
            &MenuItem::with_id(handle, "view-someday", "언젠가", true, Some("Cmd+5"))?,
        ],
    )?;

    let menu = Menu::with_items(
        handle,
        &[&app_submenu, &file_submenu, &edit_submenu, &view_submenu],
    )?;
    app.set_menu(menu)?;

    // 메뉴 클릭 라우팅 — webview 로 emit 후 web 앱이 해당 라우트로 push.
    app.on_menu_event(move |handle, event| {
        let id = event.id().0.as_str();
        match id {
            "quick-add" => {
                let _ = handle.emit("menu:quick-add", ());
            }
            "sync-now" => {
                let _ = handle.emit("menu:sync-now", ());
            }
            "view-today" => navigate(handle, "/today"),
            "view-this-week" => navigate(handle, "/this-week"),
            "view-upcoming" => navigate(handle, "/upcoming"),
            "view-anytime" => navigate(handle, "/anytime"),
            "view-someday" => navigate(handle, "/someday"),
            _ => {}
        }
    });

    Ok(())
}

fn build_tray(app: &mut tauri::App) -> tauri::Result<()> {
    let handle = app.handle();
    let menu = Menu::with_items(
        handle,
        &[
            &MenuItem::with_id(handle, "show", "하루 열기", true, None::<&str>)?,
            &MenuItem::with_id(handle, "tray-quick-add", "빠른 추가", true, None::<&str>)?,
            &PredefinedMenuItem::separator(handle)?,
            &PredefinedMenuItem::quit(handle, Some("종료"))?,
        ],
    )?;

    TrayIconBuilder::new()
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|handle, event| match event.id().0.as_str() {
            "show" => show_main(handle),
            "tray-quick-add" => {
                show_main(handle);
                let _ = handle.emit("menu:quick-add", ());
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click { .. } = event {
                show_main(tray.app_handle());
            }
        })
        .build(app)?;
    Ok(())
}

fn show_main(handle: &AppHandle) {
    if let Some(win) = handle.get_webview_window("main") {
        let _ = win.show();
        let _ = win.set_focus();
    }
}

fn navigate(handle: &AppHandle, path: &str) {
    show_main(handle);
    let _ = handle.emit("menu:navigate", path);
}

#[tauri::command]
fn quick_add_command(text: String, app: tauri::AppHandle) -> Result<(), String> {
    // 글로벌 단축키 등 외부 트리거에서 호출. webview 로 forward.
    app.emit("menu:quick-add", text).map_err(|e| e.to_string())
}

#[tauri::command]
fn sync_now_command(app: tauri::AppHandle) -> Result<(), String> {
    app.emit("menu:sync-now", ()).map_err(|e| e.to_string())
}
