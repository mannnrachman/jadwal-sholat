use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime,
};
use tauri_plugin_positioner::{Position, WindowExt};

fn should_use_dark_tray_icon() -> bool {
    matches!(dark_light::detect(), Ok(dark_light::Mode::Light))
}

fn build_tray_icon() -> tauri::image::Image<'static> {
    const TRAY_ICON_PNG: &[u8] = include_bytes!("../icons/tray-icon.png");
    let use_dark_icon = should_use_dark_tray_icon();

    image::load_from_memory_with_format(TRAY_ICON_PNG, image::ImageFormat::Png)
        .map(|i| {
            let mut rgba = i.into_rgba8();
            let monochrome = if use_dark_icon { 0u8 } else { 255u8 };
            for pixel in rgba.pixels_mut() {
                if pixel[3] > 0 {
                    pixel[0] = monochrome;
                    pixel[1] = monochrome;
                    pixel[2] = monochrome;
                }
            }

            let (w, h) = (rgba.width(), rgba.height());
            tauri::image::Image::new_owned(rgba.into_raw(), w, h)
        })
        .unwrap_or_else(|_| tauri::image::Image::new_owned(vec![255, 255, 255, 255], 1, 1))
}

fn toggle_window<R: Runtime>(app: &tauri::AppHandle<R>) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            // Try positioner first, ignore errors
            let _ = window.move_window(Position::TrayCenter);
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}

pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let refresh_i = MenuItem::with_id(app, "refresh", "Refresh", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show_i, &refresh_i, &quit_i])?;

    TrayIconBuilder::with_id("main-tray")
        .icon(build_tray_icon())
        .tooltip("Jadwal Sholat")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "show" => {
                toggle_window(app);
            }
            "refresh" => {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.eval("window.refreshPrayerTimes && window.refreshPrayerTimes()");
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            tauri_plugin_positioner::on_tray_event(tray.app_handle(), &event);

            match event {
                TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } => {
                    toggle_window(tray.app_handle());
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(())
}
