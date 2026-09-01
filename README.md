# Buku Tamu PST - BPS Kota Pagar Alam

Buku tamu Desktop Windows Tauri v2 (Rust) + SvelteKit 5 + SQLite. SPA static tanpa SSR, database SQLite via tauri-plugin-sql, window maximized dengan title bar native.

## Stack

- SvelteKit 2 + Svelte 5 runes, adapter-static fallback `index.html`, Vite port 1420 strictPort
- TypeScript strict, ESLint + Prettier, Tailwind v4, shadcn-svelte, zod 3.25, svelte-sonner
- Tauri v2 Rust + SQLite tauri-plugin-sql + plugin-dialog + plugin-autostart + plugin-single-instance
- pnpm only, Windows Desktop exclusive

## Prasyarat

- Node 20+, pnpm 9+
- Rust + Tauri CLI (hanya untuk Task 8+ backend, tidak perlu di fase frontend)

## Cara Menjalankan

```bash
pnpm install
pnpm dev        # http://127.0.0.1:1420 - strictPort, fail jika port dipakai
pnpm build      # output build/index.html + build/_app/
pnpm preview    # preview build di 1420
pnpm check      # svelte-check + tsc strict
pnpm lint       # eslint + prettier check
pnpm format     # prettier write
```

## Struktur Folder

```
src/
  app.css
  app.html
  lib/
    assets/
    components/
      ui/           # shadcn-svelte: button, card, input, select, dialog, switch, etc.
      guest/        # GuestForm, GuestTable, GuestDetail, columns, data-table-features
    constants/
      provinces.ts  # 38 provinsi Permendagri
      options.ts    # gender, pekerjaan, pendidikan, keperluan, disabilitas
    data/
      dummy.ts      # 25 record GuestVisit
    schemas/
      guest.ts      # zod superRefine 4 conditional
      guest.sql     # CREATE TABLE visits referensi
    stores/
      guests.svelte.ts     # factory $state + Database.load sqlite, fallback localStorage
      autostart.svelte.ts  # autostart enable/disable/isEnabled + first-run default
    utils/
      window.ts     # onCloseRequested confirm + single-instance guard
    types.ts
    utils.ts
  routes/
    +layout.ts      # ssr=false, prerender=false
    +layout.svelte  # Toaster + ModeWatcher + loading overlay + close handler init
    +page.svelte    # Form 16 field
    daftar/
      +page.svelte  # Table + search/filter/pagination
    statistik/
      +page.svelte  # Cards + pengaturan autostart Switch
static/
build/              # hasil pnpm build (ada index.html)
src-tauri/
  src/lib.rs        # plugin-sql + dialog + autostart + single-instance
  migrations/001_visits.sql  # CREATE TABLE visits 16 field + 4 CHECK + 3 indices
  capabilities/default.json  # windows + sql/dialog/autostart permissions
  tauri.conf.json   # maximized true, NSIS downloadBootstrapper
  Cargo.toml        # release strip/lto/codegen-units 1 panic abort
components.json
svelte.config.js
vite.config.ts     # tailwindcss + sveltekit, port 1420
```

## Fitur

- Form 16 field urut pedoman, 4 conditional (provinsi, pekerjaanLainnya, tipeDisabilitas, keperluanLainnya)
- Validasi zod inline data-invalid + aria-invalid, HP digit-only 8-15, email format, tahun 1940-now select required
- Submit simpan ke SQLite via `Database.load('sqlite:buku-tamu.db')` parameterized `$1..$16` + toast + reset, fallback localStorage saat `pnpm dev` browser
- Daftar: 25 dummy seed jika DB kosong, search nama/instansi, filter keperluan/gender, pagination 10, dialog detail, sort visit_date desc
- Statistik: total, hari ini (visit_date === ISO today), by keperluan (7), by pendidikan (8), by gender, by disabilitas Ya/Tidak, progress bar css, pengaturan autostart Switch
- Window: maximized dengan title bar native (decorations true), minimize/close, close -> confirm dialog preventDefault + forceClose guard, double launch focus existing (single-instance)
- Loading overlay di +layout.svelte saat `guestStore.loading`, autostart first-run default enable via registry HKCU (guard `btpst_autostart_init`)
- Responsive: grid 1 col mobile, 2 md, 3-4 lg; header sticky nav ke / /daftar /statistik

## Pedoman

Lihat `PEDOMAN_BUKU_TAMU.md` (16 field) dan `AGENTS.md` Rencana Aktif.

## Catatan Tauri

- Windows Desktop exclusive, bundle NSIS only, webviewInstallMode downloadBootstrapper silent
- `pnpm tauri dev` -> http://127.0.0.1:1420 (maximized, title bar tampil)
- `pnpm tauri build` -> NSIS exe di `src-tauri/target/release/bundle/nsis/`

## Verifikasi Gate

- `pnpm check` PASS (0 errors)
- `pnpm lint` PASS (prettier + eslint, src-tauri/gen di-ignore)
- `pnpm build` PASS -> build/index.html
- `cargo check --manifest-path src-tauri/Cargo.toml` PASS
- `grep -r "fetch(" src` -> 0 (no fetch, hanya plugin-sql invoke)
