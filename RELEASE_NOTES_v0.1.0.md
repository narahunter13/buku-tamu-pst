# Buku Tamu PST v0.1.0 - Backend Tauri Windows (2026-09-01)

Release backend Tauri v2 Windows-only - migrasi dari localStorage ke SQLite native, window management, autostart, dan bundle NSIS.

## Highlights B1-B6

| Keputusan | Nilai | Keterangan |
|-----------|-------|------------|
| B1 Window mode | `maximized: true`, `fullscreen: false` | Maximized true agar title bar native tetap tampil (koreksi dari fullscreen exclusive). `width 1280 x 800`, `min 1024x600`, `resizable false`, `maximizable false`, `center true` |
| B2 Decorations | `decorations: true` | Native title bar Windows (minimize/close) |
| B3 Autostart | `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` | `tauri-plugin-autostart` enable default on first run, toggle via Switch di /statistik. Registry HKCU tanpa admin |
| B4 Loading overlay | Svelte overlay di `+layout.svelte` | `{#if guestStore.loading}` fixed overlay + spinner saat `guestStore.init()` |
| B5 Bundle | `NSIS only` | `targets ["nsis"]`, `webviewInstallMode downloadBootstrapper` silent. Tidak ada MSI/WiX |
| B6 DB access | `plugin-sql Database.load` | `Database.load('sqlite:buku-tamu.db')` + `select/execute` parameterized `$1..$16`. Tanpa `fetch`/`invoke` manual. ACL `sql:default/execute/select/load/close` |

## Prasyarat

- Windows 10/11 64-bit
- **WebView2 Runtime**: bundle menggunakan `downloadBootstrapper` - installer akan download WebView2 jika belum ada. Offline fallback: embed bootstrapper akan tetap coba install; jika gagal, install WebView2 manual dari `https://developer.microsoft.com/en-us/microsoft-edge/webview2/`
- Tidak perlu admin untuk autostart (HKCU)

## Cara Install

1. Download `Buku Tamu PST_0.1.0_x64-setup.exe` dari release assets
2. Jalankan exe - NSIS installer silent, ikuti wizard
3. Aplikasi terinstall dan dapat dijalankan dari Start Menu / Desktop shortcut

| Item | Nilai |
|------|-------|
| Path bundle | `src-tauri/target/release/bundle/nsis/Buku Tamu PST_0.1.0_x64-setup.exe` |
| Size | **2.02 MB** (2,113,278 bytes) - di bawah target <15 MB |
| SHA256 | `a2ce01a0075c3c890b716ec2a8909b8fc3f20e827161080dd6f1ffda47a460d1` |
| Verifikasi | `Get-FileHash -Path "Buku Tamu PST_0.1.0_x64-setup.exe" -Algorithm SHA256` atau `certutil -hashfile "Buku Tamu PST_0.1.0_x64-setup.exe" SHA256` |

## Database

- **Lokasi**: `%APPDATA%/com.bps.bukutamu/buku-tamu.db` (Tauri `appDataDir`)
- **Migrasi**: `src-tauri/migrations/001_visits.sql` (copy dari `src/lib/schemas/guest.sql`)
- **Skema**: `visits` 16 kolom (`nama, gender, instansi, hp, email, pekerjaan, pekerjaan_lainnya, tahun_lahir, pendidikan, negara, provinsi, kab_kota, disabilitas, tipe_disabilitas, keperluan, keperluan_lainnya, visit_date, created_at`)
- **Constraints**: 4 CHECK (`hp` digit 8-15, `email` LIKE, conditional `pekerjaan/keperluan/disabilitas/negara`), `WAL` + `busy_timeout 5000`
- **Indices**: 3 (`idx_visits_date`, `idx_visits_keperluan`, `idx_visits_created DESC`)
- **Seed**: 25 dummy `src/lib/data/dummy.ts` - di-insert jika `COUNT(*) == 0` saat init (idempotent)

## Perubahan Task 8-13

- **Task 8 - Init Tauri v2**: `src-tauri/Cargo.toml`, `tauri.conf.json` (devUrl 1420, frontendDist ../build, windows maximized), `src/lib.rs` + `main.rs` + `build.rs`, `capabilities/default.json` (sql/dialog/autostart/window), icons 16 file
- **Task 9 - SQLite**: `tauri-plugin-sql 2.4.1 sqlite`, `add_migrations` 001_visits.sql, WAL, seed 25
- **Task 10 - Store refactor**: `src/lib/stores/guests.svelte.ts` async `init/add/list/stats` via `Database.load` parameterized `$1..$16`, `isTauri()` guard fallback localStorage untuk `pnpm dev` browser, overlay loading di `+layout.svelte`, `grep fetch` 0
- **Task 11 - Window**: `onCloseRequested` + `preventClose` -> `dialog.confirm` Cancel stay / Ok destroy, `minimizable true` only, `single-instance` focus existing window
- **Task 12 - Autostart**: `tauri-plugin-autostart 2`, `src/lib/stores/autostart.svelte.ts` first-run enable (`btpst_autostart_init` localStorage flag) + `isEnabled/enable/disable`, `Switch` di `/statistik`
- **Task 13 - Bundle optimize**: `bundle.targets ["nsis"]`, `webviewInstallMode downloadBootstrapper`, `Cargo profile release strip lto codegen-units 1 panic abort opt-level s`, title bar fix `maximized:true fullscreen:false`, `.prettierignore src-tauri/gen`, `src/routes/rekap/+page.svelte`

## Verifikasi

```
pnpm check  -> PASS (svelte-check 0 errors)
cargo check --manifest-path src-tauri/Cargo.toml -> PASS
pnpm build  -> PASS (build/index.html + SvelteKit adapter-static)
cargo build --manifest-path src-tauri/Cargo.toml -> PASS
pnpm lint   -> PASS
pnpm tauri build -> NSIS 2.02 MB bisa install
```

Manual gate Windows: `pnpm tauri dev` load 1420 maximized, minimize works, close -> confirm dialog, loading overlay saat init, CRUD via DB, autostart toggle registry, search/filter di /daftar, statistik query COUNT GROUP BY.

## Catatan Versi

- `package.json` version `0.0.1` (frontend)
- `src-tauri/tauri.conf.json` version `0.1.0`
- `src-tauri/Cargo.toml` version `0.1.0`
- Mismatch disengaja - frontend 0.0.1 belum bump, Tauri bundle 0.1.0 sebagai versi rilis backend pertama. Sinkronisasi di rilis berikutnya.

## Next Steps

- Bump `package.json` ke `0.1.0` agar selaras
- Uji installer di mesin Windows bersih tanpa WebView2 (validasi downloadBootstrapper)
- Tambah `src-tauri/Cargo.lock` ke repo jika reproducible build diperlukan (saat ini di .gitignore)
