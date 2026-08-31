# Buku Tamu PST - BPS Kota Pagar Alam

Buku tamu Desktop Tauri v2 (Rust) + SvelteKit 5 + SQLite. Fase frontend-only SPA static tanpa SSR, persist mock di localStorage.

## Stack

- SvelteKit 2 + Svelte 5 runes
- TypeScript strict, ESLint + Prettier, Tailwind v4, shadcn-svelte
- adapter-static fallback `index.html`, Vite port 1420 strictPort
- zod 3.25 validasi, svelte-sonner toast, lucide
- pnpm only

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
      ui/           # shadcn-svelte: button, card, input, select, dialog, etc.
      guest/        # GuestForm, GuestTable, GuestDetail
    constants/
      provinces.ts  # 38 provinsi Permendagri
      options.ts    # gender, pekerjaan, pendidikan, keperluan, disabilitas
    data/
      dummy.ts      # 25 record GuestVisit
    schemas/
      guest.ts      # zod superRefine 4 conditional
      guest.sql     # CREATE TABLE visits referensi
    stores/
      guests.svelte.ts # factory $state.raw + localStorage btpst_mock_visits
    types.ts
    utils.ts
  routes/
    +layout.ts      # ssr=false, prerender=false
    +layout.svelte  # Toaster + ModeWatcher
    +page.svelte    # Form 16 field
    daftar/
      +page.svelte  # Table + search/filter/pagination
    statistik/
      +page.svelte  # Cards total/hari ini/by keperluan/by pendidikan/by gender/by disabilitas
static/
build/              # hasil pnpm build (ada index.html)
components.json
svelte.config.js
vite.config.ts     # tailwindcss + sveltekit, port 1420
```

## Fitur Fase Frontend

- Form 16 field urut pedoman, 4 conditional (provinsi, pekerjaanLainnya, tipeDisabilitas, keperluanLainnya)
- Validasi zod inline data-invalid + aria-invalid, HP digit-only 8-15, email format, tahun 1940-now select required
- Submit simpan ke guestStore + localStorage `btpst_mock_visits` + toast + reset
- Daftar: 25 dummy + entry baru, search nama/instansi, filter keperluan/gender, pagination 10, dialog detail
- Statistik: total, hari ini (visit_date === ISO today), by keperluan (7), by pendidikan (8), by gender, by disabilitas Ya/Tidak, progress bar css
- Responsive: grid 1 col mobile, 2 md, 3-4 lg; header sticky nav ke / /daftar /statistik

## Pedoman

Lihat `PEDOMAN_BUKU_TAMU.md` (16 field) dan `AGENTS.md` Rencana Aktif.

## Catatan Tauri

Fase backend (src-tauri, SQLite, IPC invoke) ditunda sampai Gate Task 7 APPROVED.

## Verifikasi Gate AC1-AC10

- `pnpm check` PASS
- `pnpm build` PASS -> build/index.html
- `pnpm lint` PASS
- Form conditional jalan, daftar filter reaktif, statistik cards tampil
