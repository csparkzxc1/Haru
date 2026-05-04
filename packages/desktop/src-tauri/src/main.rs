// macOS 에선 release 빌드 시 콘솔 창을 띄우지 않도록.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    haru_desktop_lib::run()
}
