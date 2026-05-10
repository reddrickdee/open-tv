# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Fred TV is a cross-platform IPTV desktop application built with **Tauri v2** (Rust backend + Angular 17 frontend). It is a single-product repository (not a monorepo).

### Key Commands

| Task | Command |
|------|---------|
| Install JS deps | `pnpm install` |
| Angular dev server | `npx ng serve` (serves at http://localhost:4200) |
| Angular build | `npx ng build --configuration=development` |
| Angular tests | `npx ng test --watch=false --browsers=ChromeHeadless` |
| Rust check | `cd src-tauri && cargo check` |
| Rust build | `cd src-tauri && cargo build` |
| Full dev mode | `DISPLAY=:1 npx tauri dev` |
| Full build | `npx tauri build` |

### Important Notes

- **Rust version**: `Cargo.toml` requires `rust-version = "1.91.1"`. Ensure the toolchain is updated with `rustup install 1.91.1 && rustup default 1.91.1`.
- **pnpm build approvals**: The project uses `pnpm.onlyBuiltDependencies` in `package.json` to allow `esbuild` and `nice-napi` build scripts. Without this, pnpm will silently skip native module compilation and Angular builds will fail.
- **Display for Tauri**: Running `tauri dev` or `tauri build` requires a display. Use `DISPLAY=:1` with the virtual framebuffer (Xvfb). The EGL/DRI3 warnings are harmless in this environment.
- **Angular tests**: Most unit tests (25/29) have pre-existing failures due to missing `ToastConfig` providers in spec files. This is a known codebase issue, not an environment problem. The test framework itself (Karma + ChromeHeadless) works correctly.
- **Tauri dev startup**: `npx tauri dev` automatically runs `npm run start` (Angular dev server) as a `beforeDevCommand`, then compiles and runs the Rust backend. The first compilation takes ~1 minute; subsequent runs are fast due to incremental compilation.
- **System dependencies (Linux)**: Required for building: `libwebkit2gtk-4.1-dev`, `build-essential`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`, `libxdo-dev`.
- **Runtime dependencies**: `mpv`, `ffmpeg`, `yt-dlp` must be installed for full app functionality (playback, recording, stream resolution).
