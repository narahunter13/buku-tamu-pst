# Buku Tamu PST v0.1.2 - Full Width Form + Native Title Bar + Pengaturan (2026-09-02)

## Ringkasan
Full-width form sections p-4, Switch autostart high-contrast, native guards (autocomplete/suggestion off, contextmenu/drag/keydown block), custom frameless title bar h-8 minimize+close, gap bawah + scrollbar isolate di #app-scroll, dan halaman Pengaturan terpisah. Frontend-only release; NSIS artifact masih v0.1.0 (belum rebuild).

## Detail Perubahan

### 1. Full-width reorganize form (GuestForm + layout)
- src/lib/components/guest/GuestForm.svelte: Card.Root mx-auto max-w-3xl -> w-full max-w-none overflow-hidden p-0, Header/Content/Footer px-6/md:px-8 -> p-4, grid gap-5 md:grid-cols-2 -> per-section space-y-8 dengan 4 section: Identitas (field 1-5), Pekerjaan (6-9), Lokasi (10-12), Disabilitas & Keperluan (13-16) masing-masing grid md:grid-cols-2 lg:grid-cols-3 + Badge + Separator, icons @lucide/svelte User/Briefcase/MapPinned/ClipboardList/Sparkles, conditional slide col-span; 16 field urut PEDOMAN tetap, validasi Zod tetap.
- src/routes/+layout.svelte: main mx-auto max-w-[1200px] px-4 py-6 -> w-full p-4 pb-0, header inner mx-auto max-w-[1200px] -> w-full, kemudian refactor flex wrapper h-dvh + #app-scroll overflow-y-auto (lihat poin 5).
- src/routes/+page.svelte tetap (wrapper form).

### 2. Autostart Switch high-contrast
- src/lib/components/ui/switch/switch.svelte: border-transparent -> border + shadow-xs, data-checked:bg-primary + data-[state=checked]:bg-primary, data-unchecked:border-border bg-input + data-[state=unchecked], thumb bg-background shadow-sm border black/[0.04], mapping state checked/unchecked untuk bits-ui, dark mode overrides.

### 3. Native feel hardening (suggestion off, contextmenu/drag block)
- src/app.html: html lang en -> id, viewport tambah maximum-scale=1 user-scalable=no viewport-fit=cover, meta color-scheme light, body data-sveltekit-preload-data hover -> off, autocomplete off autocorrect off spellcheck false.
- src/app.css: @layer base html overscroll none tap-highlight, body bg-paper + overscroll none + user-select none (input/textarea text), -webkit-user-drag none img/svg, ::selection, [data-tauri-drag-region] drag/no-drag, autofill hide ::-webkit-contacts-auto-fill-button ::ms-reveal, prefers-reduced-motion, plus fix gap/scroll (poin 5).
- src/routes/+layout.svelte: setupNativeGuards() -> contextmenu preventDefault, dragstart/dragover/drop prevent, keydown F5/F12/Ctrl+R/I/U/S/P block, selectstart kecuali input/textarea, attribute data-tauri-native.
- src/lib/components/guest/GuestForm.svelte: Input nama/instansi/hp/email/pekerjaanLainnya/kab_kota autocomplete off + data-lpignore + spellcheck false, Textarea keperluanLainnya sama, form autocomplete off.
- src/routes/rekap/+page.svelte dan search rekap ter-cover via global CSS guard (perubahan minor wrap GuestDetail).

### 4. Custom title bar - frameless hanya minimize + close
- src-tauri/tauri.conf.json: decorations true -> false, resizable false -> true (WS_THICKFRAME kompensasi gap HWND borderless), tetap maximized true, minimizable true, closable true.
- src-tauri/capabilities/default.json: tambah core:window:allow-start-dragging.
- src/lib/components/TitleBar.svelte BARU: flex h-8 shrink-0 border-b bg-paper select-none, data-tauri-drag-region, 2 Button Minus (minimize) dan X (close hover destructive), hanya render jika isTauri(), data-tauri-drag-region=false no-drag pada buttons.
- src/lib/utils/window.ts: tambah minimizeWindow() dan closeWindowWithConfirm() reusable, keep forceClose + onCloseRequested confirm destroy.
- src/routes/+layout.svelte: import TitleBar + isTauri, render <TitleBar/> di atas header, header sticky top-8 saat Tauri, flex wrapper.
- src/app.css: [data-tauri-drag-region] app-region drag + no-drag.

### 5. Gap bawah + scrollbar tidak mengenai title bar
- src/app.css: html, body height 100% overflow hidden, body min-height 100dvh overflow hidden.
- src/routes/+layout.svelte: refactor jadi <div flex h-dvh h-screen flex-col> <TitleBar/> <div #app-scroll flex flex-1 flex-col overflow-y-auto [scrollbar-gutter:stable]> <header sticky top-0> <main w-full flex-1 p-4>; TitleBar flex h-8 shrink-0 (tidak sticky/fixed), main flex-1; scroll hanya di #app-scroll, scrollbar di bawah title bar.
- src-tauri/tauri.conf.json: resizable true (gap HWND borderless fix, lihat poin 4).
- src/lib/components/TitleBar.svelte: hapus sticky/z, jadi flex h-8 shrink-0.

### 6. Halaman Pengaturan standalone
- BARU src/routes/pengaturan/+page.svelte: grid lg:grid-cols-2 Card Autostart + Database, autostartStore + Switch badge Aktif/Nonaktif, handlers handleClear/handleResetDummy/handleExport/handleReveal (plugin-dialog confirm/save, invoke get_db_path/export_db, revealItemInDir), Separator + Card Info Versi 0.1.0 Tauri v2 + SQLite, footer link.
- src/routes/statistik/+page.svelte: hapus seluruh section settings-heading lines 466-531 + imports Switch/Label/autostartStore + state dbBusy*/dbPath + handlers, dari 532 baris -> 322 baris, sisakan footer Link Ke Pengaturan.
- src/routes/+layout.svelte: nav tambah Button href /pengaturan aria-current page, sekarang 5 item Form/Daftar/Statistik/Rekap/Pengaturan, header flex w-full justify-between.
- src/routes/rekap/+page.svelte: wrap GuestDetail placement fix (12 lines).

### 7. Lain-lain
- vite.config.ts: server.watch.ignored ['**/src-tauri/**'] fix EBUSY app_lib.dll (dari 7bcd1d1, tetap ada).
- Style: pnpm check 0 errors, cargo check PASS dev profile, pnpm build -> build/index.html PASS, pnpm lint PASS.

## Prasyarat & Teknis
- WebView2 Runtime (bundle webviewInstallMode downloadBootstrapper silent), Windows 10/11 x64.
- DB: %APPDATA%/com.bps.bukutamu/buku-tamu.db (SQLite via tauri-plugin-sql), WAL + busy_timeout 5000, indices idx_visits_date/keperluan/created, seed 25 dummy jika kosong.
- Store: Database.load('sqlite:buku-tamu.db') + select/execute $1..$16 parameterized, fallback isTauri guard -> localStorage untuk pnpm dev browser.
- ACL: sql:default/execute/select/load/close + dialog:confirm/message + autostart:enable/disable/is-enabled + core window allow-close/minimize/set-fullscreen/start-dragging, single-instance focus.
- No fetch (grep 0), no secret di opencode.json (clean 11 baris).

## Verifikasi
- pnpm check: 0 errors 0 warnings
- cargo check --manifest-path src-tauri/Cargo.toml: Finished dev profile 0.80s
- pnpm build: wrote site to build + build/index.html (18.2s)
- git status clean post-commit, git log --oneline 7bcd1d1 -> v0.1.2

## Catatan NSIS
- Artifact belum rebuild setelah frontend-only changes: src-tauri/target/release/bundle/nsis/Buku Tamu PST_0.1.0_x64-setup.exe 2,112,950 bytes (2.11 MB) LastWrite 2026-09-01 08:47, SHA256 1CFFC7530F6B0F72B65349A517088B77C38083AF496CC9B67327E7ACB4DD5725. Release v0.1.2 publish tanpa asset baru (frontend-only); next pnpm tauri build akan bump artifact ke 0.1.2 dan upload via gh release upload v0.1.2.

## Mismatch Versi
- package.json 0.0.1 vs src-tauri/tauri.conf.json 0.1.0 - disengaja, bump tauri version next build.

## Instalasi
- Download NSIS v0.1.0 (atau tunggu rebuild v0.1.2) -> install silently, autostart HKCU Run, DB di AppData.
