# Buku Tamu PST v0.1.1 - Fix Statistik Hari Ini + Vite Watcher (2026-09-02)

Patch frontend-only untuk perbaikan card Statistik Hari Ini selalu 0 dan error EBUSY Vite watcher.

## Ringkasan

- Fix 1 - Statistik Hari Ini 0: card Hari Ini menampilkan 0 meski ada data hari ini
- Fix 2 - Vite EBUSY: EBUSY resource busy or locked saat Vite watch src-tauri/target/debug/deps/app_lib.dll

## Root Cause dan Fix

### Statistik Hari Ini 0

Root cause: src/lib/stores/guests.svelte.ts INSERT hanya 16 kolom tanpa visit_date/created_at. Fallback ke DB DEFAULT date(now,localtime) menggunakan OS localtime, tidak sama dengan Asia/Jakarta (WIB) yang dipakai getNowJakartaParts() untuk hitung todayIso. Akibat v.visit_date === todayIso tidak pernah match.

Fix:
- INSERT_COLUMNS 16 -> 18 kolom tambah visit_date,created_at (src/lib/stores/guests.svelte.ts:18)
- INSERT_PLACEHOLDERS $1..$16 -> $1..$18
- insertParams(input, visit_date, created_at) 18 param parameterized
- add() generate getNowJakartaParts() untuk insert Tauri agar tanggal konsisten Jakarta
- seedIfEmpty dan resetToDummy pakai dummy.visit_date/dummy.created_at historis 2026-08-10..22 agar dummy tetap historis, bukan now
- src/routes/statistik/+page.svelte todayCount dari strict === todayIso -> String(v.visit_date).slice(0,10) === todayIso defensif untuk format YYYY-MM-DD atau dengan waktu

### Vite Watcher EBUSY

Root cause: Vite dev server watch seluruh workspace termasuk src-tauri/target yang di-lock Cargo.

Fix: vite.config.ts tambah server.watch.ignored: [**/src-tauri/**] untuk hindari lock app_lib.dll.

## File Terdampak

| File | Perubahan |
|------|-----------|
| src/lib/stores/guests.svelte.ts | 16->18 kolom, $1..$18, insertParams 18 param, add/seed/reset Jakarta dates |
| src/routes/statistik/+page.svelte | todayCount slice(0,10) defensif |
| vite.config.ts | watch.ignored src-tauri |

## Cara Verifikasi

1. Hari Ini 1: clear DB -> tambah 1 tamu hari ini -> card Hari Ini harus 1 (sebelum fix: 0)
2. Reset dummy -> 0: Pengaturan -> Reset ke Dummy (25) -> dummy tanggal 2026-08-10..22 -> Hari Ini harus 0 (benar historis)
3. Vite EBUSY hilang: pnpm dev tidak lagi error EBUSY app_lib.dll saat Cargo build

## Prasyarat dan DB

- Tetap Windows 10/11 64-bit + WebView2 Runtime (downloadBootstrapper NSIS)
- DB lokasi: %APPDATA%/com.bps.bukutamu/buku-tamu.db (tidak berubah)
- Skema: visits 18 kolom (16 input + visit_date/created_at), 4 CHECK, 3 indices tetap (idx_visits_date, idx_visits_keperluan, idx_visits_created DESC)
- Seed: 25 dummy 2026-08-10..22 tetap

## NSIS Asset

- Patch ini frontend-only, NSIS belum rebuild untuk v0.1.1. Gunakan asset v0.1.0:
  - Path: src-tauri/target/release/bundle/nsis/Buku Tamu PST_0.1.0_x64-setup.exe
  - Size v0.1.0: 2.02 MB (2,113,278 bytes) SHA256 a2ce01a0075c3c890b716ec2a8909b8fc3f20e827161080dd6f1ffda47a460d1
  - Build lokal terbaru 2026-09-01 08:47: Size 2,112,950 bytes SHA256 1CFFC7530F6B0F72B65349A517088B77C38083AF496CC9B67327E7ACB4DD5725 (belum publish - next pnpm tauri build akan bump ke 0.1.1)
- Next build akan bump tauri.conf.json/Cargo.toml ke 0.1.1 dan publish NSIS baru.

## Verifikasi Build

```
pnpm check  -> PASS (svelte-check 0 errors, 0 warnings)
cargo check --manifest-path src-tauri/Cargo.toml -> PASS (sebelum patch, frontend-only tidak ubah Rust)
pnpm build  -> PASS (build/index.html via adapter-static)
```

## Catatan Versi

- package.json 0.0.1 (belum bump - sinkron next rilis)
- src-tauri/tauri.conf.json 0.1.0 (NSIS v0.1.0)
- src-tauri/Cargo.toml 0.1.0
