# AGENTS.md - Pedoman Orkestrasi Subagents (Single Source of Truth)

> **DOKUMEN WAJIB** - satu-satunya sumber kebenaran orkestrasi project. File `.opencode/core.md` sudah DIHAPUS dan tidak digunakan lagi. Semua konteks, rencana, dan checklist task dikelola di file ini. Saat menginisialisasi project baru, WAJIB overwrite bagian [placeholder] di bawah sebelum pipeline digunakan. Dokumen ini adalah pedoman wajib saat bekerja, baik menggunakan subagents maupun mengerjakan sendiri di session baru.

## Konteks Proyek

<!-- WAJIB DIISI saat inisialisasi project - OVERWRITE langsung di file ini, jangan buat file terpisah -->

- **Nama proyek**: Buku Tamu PST
- **Deskripsi**: Buku tamu berbasis Desktop dengan teknologi Tauri v2 (Rust) + SvelteKit menggunakan database SQLite
- **Stack**: frontend: SvelteKit + Svelte 5 | backend: Tauri v2 (Rust) | database: SQLite | infra/deploy: Tauri Desktop (Windows) | package manager: pnpm
- **Sumber kebenaran produk**: `prd.md` / spec / issue tracker di project root
- **Tooling verifikasi**: typecheck = `pnpm check`, build = `pnpm build`, test = `pnpm test`

> **Aturan Inisialisasi**: Ketika project diinisialisasi (boilerplate di-clone / `pnpm init` / setup awal), agent pertama yang bertugas WAJIB langsung mengisi bagian Konteks Proyek di atas dengan nilai konkret project tersebut dan menghapus semua `[placeholder]`. Jangan biarkan placeholder kosong melewati fase inisialisasi. Jangan membuat `core.md` baru - semua ditulis di `AGENTS.md` ini.

## Prinsip utama: isolated specialized subagents

Setiap pekerjaan non-trivial WAJIB didelegasikan ke subagent khusus yang terisolasi - BUKAN dikerjakan langsung di session utama. Tujuannya **penghematan token**: main session hanya menerima ringkasan hasil, bukan seluruh isi file.

Arsitektur diputuskan SEKALI oleh @planner dan dituliskan ke "Rencana Aktif" di file ini. Engineer/coder TIDAK melakukan eksplorasi ulang untuk memutuskan arsitektur; mereka hanya membaca rencana + file yang relevan dengan task-nya.

## Aturan Penghematan Token (cache-first)

Prioritas tertinggi: minimalkan konsumsi token di setiap langkah.

1. **Cache-first**: jangan baca ulang file yang sama atau grep path yang sama dalam satu session. Gunakan hasil tool sebelumnya. Baca ulang HANYA jika ada indikasi file berubah.
2. **Delegation berbasis path**: kirim PATH FILE + acceptance criteria, bukan isi file. Subagent membaca filenya sendiri di konteks terisolasinya.
3. **Ringkasan hasil**: subagent melapor balik dengan ringkasan singkat (maksimal sekitar 20 baris), bukan isi file lengkap.
4. **Batch tool calls**: paralelkan pembacaan/search independen dalam satu message untuk mengurangi round-trip.
5. **Reuse rencana**: jika pola/rencana serupa sudah ada di "Rencana Aktif", gunakan kembali - jangan mendesain ulang dari nol (cache hit arsitektural).

## Tim subagents

| Agent              | Peran                                                                                   |
| ------------------ | --------------------------------------------------------------------------------------- |
| @planner           | Menyusun rencana; rencana dituliskan ke "Rencana Aktif" di file ini                     |
| @task-manager      | Memecah rencana menjadi task kecil bertipe; checklist ditulis ke sini                   |
| @frontend-engineer | Eksekusi penuh task tipe `frontend` (fitur besar)                                       |
| @backend-engineer  | Eksekusi penuh task tipe `backend` (API/DB/services)                                    |
| @coder             | HANYA perbaikan ringan (typo, satu fungsi, tweak kecil)                                 |
| @code-reviewer     | Review kode, read-only                                                                  |
| @qa                | Verifikasi vs acceptance criteria, bash-only                                            |
| @doc-writer        | Dokumentasi markdown                                                                    |
| @commiter          | Git: staging selektif, commit, branch, push - WAJIB konfirmasi user sebelum commit/push |

Muat skill proyek yang relevan dari `.opencode/skills/` bila ada (agent akan memuatnya sendiri).

## Pipeline standar

Untuk pekerjaan non-trivial (fitur baru, refactor besar):

```
planner -> task-manager -> frontend-engineer / backend-engineer / coder -> code-reviewer -> qa -> doc-writer -> commiter
```

1. **@planner** menyusun rencana (arsitektur, stack, testing strategy), lalu rencana ditulis ke bagian **"Rencana Aktif"** di bawah.
2. **@task-manager** memecah rencana menjadi task kecil dengan tipe (`frontend`/`backend`/`light-fix`) dan menuliskan checklist ke "Rencana Aktif".
3. **Routing eksekusi**:
   - task `frontend` -> **@frontend-engineer**
   - task `backend` -> **@backend-engineer**
   - perbaikan ringan -> **@coder**
4. Engineer/coder memverifikasi typecheck/build sendiri sebelum melapor.
5. **@code-reviewer** meninjau; temuan BLOCKER/MAJOR dikembalikan ke engineer/coder terkait.
6. **@qa** menjalankan verifikasi penuh vs acceptance criteria; FAIL dikembalikan ke engineer/coder.
7. **@doc-writer** memperbarui dokumentasi setelah perilaku final stabil.
8. **@commiter** menangani git - hanya setelah QA PASS; @commiter WAJIB menunjukkan rencana commit (file, pesan, branch) dan mendapat persetujuan user sebelum eksekusi.

Ulangi loop `engineer -> reviewer -> qa` hingga APPROVED + PASS. Update status checklist di "Rencana Aktif" setiap task selesai/batal.

Jalur cepat (hemat token): jika pola/rencana serupa sudah ada di "Rencana Aktif", skip @planner/@task-manager dan reuse rencana yang ada. Review selektif: code-reviewer & QA wajib hanya untuk task `frontend`/`backend` besar.

## Kapan tidak perlu full pipeline

- Perbaikan sangat kecil (typo, satu baris): delegasikan ke @coder saja, atau kerjakan langsung bila trivial.
- Dokumentasi saja: cukup @doc-writer.
- Diskusi/perencanaan: cukup @planner.

## Keseimbangan kualitas, arsitektur, dan cost

- **Kualitas**: dijaga melalui acceptance criteria yang jelas + code-reviewer, tetapi review hanya wajib untuk task besar (review selektif = cost rendah).
- **Arsitektur**: single source of truth ada di "Rencana Aktif" di file ini - tidak didesain ulang tiap task; reuse rencana yang sudah ada.
- **Cost**: ukuran konteks diminimalkan lewat cache-first, delegation berbasis path, dan ringkasan hasil.

## Aturan Anti-AI Slop (Wajib untuk Agent WRITE)

Berlaku untuk `@frontend-engineer`, `@backend-engineer`, `@coder`, `@doc-writer` (semua agent dengan permission `write` / tanpa `edit: deny`).

1. DILARANG menghasilkan em-dash `—` (U+2014), en-dash `–` (U+2013), bullet dekoratif `•`, ellipsis karakter tunggal `…`, emoticon `:) :D ;)`, emoji, atau dekorasi Unicode sejenis di kode, komentar, markdown, commit message, maupun output file — KECUALI user meminta eksplisit atau karakter tersebut adalah data konten yang memang diperlukan.
2. Gunakan hyphen-minus `-` (U+002D) untuk pemisah, dan `...` (tiga titik ASCII) bila perlu ellipsis.
3. Gaya bahasa: langsung, faktual, tanpa hiperbola/pujian berlebihan. Jangan sisipkan frasa generik AI.
4. Pelanggaran = temuan `MINOR` (docs/komentar) atau `MAJOR` (kode/commit) oleh `@code-reviewer`; `@qa` wajib menolak jika ditemukan di artefak yang diverifikasi. Untuk `@doc-writer`, emoji/emoticon hanya boleh jika user minta eksplisit.

## Aturan delegation

- Delegasikan via mention: `@planner`, `@task-manager`, dst.
- Berikan context lengkap pada setiap delegation: task number, path file, dan acceptance criteria - jangan asumsikan subagent tahu riwayat percakapan.
- Hemat token: berikan PATH FILE + acceptance criteria pada delegation, BUKAN isi file - subagent membaca filenya sendiri di konteks terisolasinya; main session hanya menerima ringkasan hasil.
- Subagent read-only (planner, task-manager, code-reviewer, qa) TIDAK boleh diminta mengubah file kode.
- Keputusan ambigu selama pipeline = eskalasi kembali ke user, jangan ditebak oleh agent manapun.

## Session baru

Saat memulai session baru:

1. Baca `AGENTS.md` ini (termasuk "Rencana Aktif" di bawah) sebagai cache konteks SEBELUM membaca file kode lain. File ini adalah satu-satunya sumber kebenaran - jangan mencari `core.md`.
2. Cek status repo (`git status`) sebelum mulai agar tidak menimpa pekerjaan yang belum selesai.
3. Lihat "Rencana Aktif": jika ada pipeline belum tuntas, mulai dari tahap terakhir yang diketahui (lihat status checklist).

## Verifikasi minimum sebelum selesai

Tidak ada pekerjaan yang dianggap selesai tanpa: typecheck lulus, build sukses, dan (bila tersedia) test/smoke test lulus.

## Cara Memanfaatkan AGENTS.md Secara Optimal dan Efisien

> Panduan ini untuk main session dan semua subagent agar penggunaan AGENTS.md hemat token dan tetap konsisten.

### 1. Prinsip Single Source of Truth

- **Hanya AGENTS.md** yang dibaca untuk konteks, stack, rencana, dan daftar task. Jangan membuat atau membaca `.opencode/core.md` (sudah dihapus). Jika menemukan referensi lama ke `core.md`, anggap itu = `AGENTS.md`.
- Jangan duplikasi informasi ke file lain (mis. `prd.md` untuk kebutuhan produk boleh, tapi konteks orkestrasi tetap di AGENTS.md).

### 2. Kapan Membaca vs Kapan Tidak

- **Wajib baca di awal session**: sekali di awal, cache hasilnya untuk sisa session. Jangan baca ulang di setiap delegasi.
- **Wajib baca sebelum delegasi**: planner, task-manager, engineer harus membaca bagian "Rencana Aktif" dan "Konteks Proyek" sebelum bekerja, tapi cukup sekali.
- **Tidak perlu baca ulang** jika sudah ada di history tool result session yang sama dan belum ada edit baru.

### 3. Kapan Menulis / Overwrite

- **Inisialisasi project**: langsung overwrite "Konteks Proyek" (isi placeholder) + set tooling verifikasi konkret (`pnpm typecheck`, `pnpm build`, dll.). Commit perubahan AGENTS.md sebagai commit pertama.
- **Fase planner**: tulis ke `## Rencana` (arsitektur, stack, testing strategy, milestone, risiko).
- **Fase task-manager**: tulis ke `## Daftar Task` (checklist ber-status `[ ]`/`[x]`).
- **Selama eksekusi**: update status checklist `[x]` saat task selesai, tanpa menghapus history rencana. Rencana lama yang sudah selesai dipindah ke arsip (komentar HTML atau hapus setelah rilis) agar file tetap ramping - maksimal simpan 1 rencana aktif + 1 rencana sebelumnya sebagai referensi.
- **Hemat token saat menulis**: edit hanya bagian "Rencana Aktif", jangan rewrite seluruh file jika tidak perlu. Gunakan edit dengan `oldString` yang presisi.

### 4. Pola Delegasi Hemat Token

- Main session mengirim ke subagent: `path AGENTS.md + nomor task + acceptance criteria` - bukan isi AGENTS.md.
- Subagent membaca AGENTS.md sendiri di konteks terisolasi, main session hanya terima ringkasan 20 baris.
- Batch delegasi independen secara paralel (mis. frontend + backend yang tidak saling dependensi).

### 5. Menjaga File Tetap Ramping

- AGENTS.md bukan log harian - hanya simpan rencana aktif dan daftar task aktif. Arsipkan rencana lama ke `docs/archive/` atau hapus setelah di-merge.
- Gunakan checklist markdown `- [ ]` / `- [x]` agar status mudah diparse tanpa narasi panjang.
- Hindari menempelkan dump kode atau log build ke AGENTS.md - cukup tulis "typecheck PASS" + command yang dijalankan.

### 6. Integrasi dengan Tooling

- `opencode.json` sudah di-set `instructions: ["AGENTS.md"]` sehingga OpenCode otomatis memuat file ini sebagai instruksi global. Tidak perlu konfigurasi tambahan.
- Semua agent di `.opencode/agents/*.md` sudah diupdate untuk merujuk ke `AGENTS.md` (bukan `core.md`). Jika menambah agent baru, ikuti pola yang sama.

### 7. Anti-Pattern yang Harus Dihindari

- Membuat `core.md` baru atau menduplikasi AGENTS.md ke `.opencode/`.
- Membaca AGENTS.md berulang kali dalam satu session tanpa perubahan.
- Menulis rencana panjang lebar tanpa checklist actionable - selalu akhiri dengan daftar task yang bisa dieksekusi engineer tanpa ambiguitas.
- Membiarkan placeholder `[nama]`/`[stack]` kosong melewati inisialisasi.

---

# Rencana Aktif

> Bagian ini ditulis @planner (rencana) dan @task-manager (daftar task). Session utama melakukan editnya di file ini.

## Rencana

### Judul: Buku Tamu PST - Frontend SPA SvelteKit 5 (Fase Frontend-Only)

- **Status:** approved 2026-08-31 - 8 poin user locked + 5 klarifikasi tambahan
- **Pemilik:** @planner (revisi 2)
- **Sumber:** PEDOMAN_BUKU_TAMU.md 16 field + AGENTS.md Konteks Proyek + keputusan user
- **Klarifikasi final:** dummy TS saja (tanpa JSON/.db), statistik WAJIB, persist localStorage `btpst_mock_visits`, validasi hp digit-only 8-15, tahun lahir select 1940-sekarang placeholder kosong required
- **Mode:** SPA static `ssr=false` `fallback:index.html` port 1420 locked, Tailwind v4 + shadcn-svelte, ESLint+Prettier, TS strict true, pnpm only

#### 1. Kriteria Sukses Fase Frontend (Gate sebelum Tauri Backend)

- AC1: `pnpm check` PASS (svelte-check + tsc strict)
- AC2: `pnpm build` PASS hasil `build/index.html` + `build/_app/`
- AC3: `pnpm lint` PASS (eslint + prettier)
- AC4: `pnpm dev` jalan di 1420 strictPort (fail jika occupied)
- AC5: Form 16 field render urut pedoman, 4 conditional jalan (provinsi, pekerjaanLainnya, tipeDisabilitas, keperluanLainnya)
- AC6: Validasi zod error inline `data-invalid` + `aria-invalid`, hp digit 8-15, email format
- AC7: Submit valid ke mock store + localStorage + toast + muncul di /daftar
- AC8: /daftar tampil 25 dummy + entry baru, search/filter reaktif, detail dialog
- AC9: /statistik tampil total/hari ini/by keperluan (wajib)
- AC10: Approval user eksplisit sebelum lanjut Tauri

Out-of-scope fase ini: `src-tauri/`, Rust, `tauri-plugin-sql`, IPC `invoke` (ditunda Task 8-11).

#### 2. Arsitektur SPA

- SvelteKit 2 + Svelte 5 runes, `adapter-static` fallback `index.html`, `src/routes/+layout.ts` `ssr=false prerender=false`, `vite.config.ts` port 1420 strictPort + `@tailwindcss/vite`
- Lib: `lib/schemas/guest.ts` (zod superRefine 4 rules), `lib/types.ts`, `lib/constants/provinces.ts` 38 provinsi, `lib/data/dummy.ts` 25 records, `lib/stores/guests.svelte.ts` factory `$state.raw` + localStorage persist
- Routes: `/` Form, `/daftar` Table+Dialog, `/statistik` Cards
- Alur mock: seed dummy jika localStorage kosong -> form submit zod parse -> map `Lainnya: {isian}` -> `store.add()` -> `localStorage.setItem` -> toast -> reset

#### 3. Tech Stack

- SvelteKit 2, Svelte 5, adapter-static 3, Vite 6, TS strict true, ESLint+Prettier via `sv add`, Tailwind v4 via `sv add tailwindcss`, shadcn-svelte latest, zod 3.25, @lucide/svelte, svelte-sonner, pnpm only

#### 4. Skema DB Referensi (untuk zod + dummy, eksekusi native di Task 9)

```sql
CREATE TABLE visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL, gender TEXT CHECK(gender IN ('Laki-laki','Perempuan')),
  instansi TEXT NOT NULL, hp TEXT CHECK(hp GLOB '*[0-9]*' AND length(hp) BETWEEN 8 AND 15),
  email TEXT CHECK(email LIKE '%_@_%._%'),
  pekerjaan TEXT CHECK(pekerjaan IN ('Pelajar/Mahasiswa','Peneliti/Dosen','ASN/TNI/Polri','Pegawai BUMN/BUMD','Pegawai Swasta','Wiraswasta','Lainnya')),
  pekerjaan_lainnya TEXT, tahun_lahir INTEGER CHECK(tahun_lahir BETWEEN 1940 AND 2026),
  pendidikan TEXT, negara TEXT DEFAULT 'Indonesia', provinsi TEXT, kab_kota TEXT NOT NULL,
  disabilitas TEXT CHECK(disabilitas IN ('Ya','Tidak')), tipe_disabilitas TEXT,
  keperluan TEXT, keperluan_lainnya TEXT,
  visit_date TEXT DEFAULT (date('now','localtime')), created_at TEXT DEFAULT (datetime('now','localtime')),
  CHECK((pekerjaan!='Lainnya' AND pekerjaan_lainnya IS NULL) OR (pekerjaan='Lainnya' AND pekerjaan_lainnya IS NOT NULL)),
  CHECK((keperluan!='Lainnya' AND keperluan_lainnya IS NULL) OR (keperluan='Lainnya' AND keperluan_lainnya IS NOT NULL)),
  CHECK((disabilitas='Tidak' AND tipe_disabilitas IS NULL) OR (disabilitas='Ya' AND tipe_disabilitas IS NOT NULL)),
  CHECK((negara!='Indonesia' AND provinsi IS NULL) OR (negara='Indonesia' AND provinsi IS NOT NULL))
);
```

Mapping 16 field pedoman ke kolom, `Lainnya: {isian}` dipisah agar query atomik, display gabung di UI.

#### 5. Data Dummy

- `src/lib/data/dummy.ts` 25 records typed `GuestVisit`, distribusi: semua 7 pekerjaan, 8 pendidikan, 7 keperluan, 5x disabilitas Ya, 3x luar negeri provinsi null, tahun 1945-2006
- Store `src/lib/stores/guests.svelte.ts` factory, `$state.raw` array, `nextId` `$derived`, `add()`, `list()`, persist `localStorage btpst_mock_visits`

#### 6. Konfigurasi Final

- `svelte.config.js` adapter-static fallback `index.html`, `vitePreprocess`, `runes:true`
- `vite.config.ts` plugins `[tailwindcss(), sveltekit()]`, `server.port 1420 strictPort true host 127.0.0.1`, `preview same`
- `src/routes/+layout.ts` `export const ssr=false; export const prerender=false`
- `components.json` aliases `$lib/components/ui`, iconLibrary `@lucide/svelte`

#### 7. Validasi

- hp: `z.string().regex(/^[0-9]{8,15}$/, 'HP 8-15 digit')` (digit only)
- email: `z.string().email()`
- tahun_lahir: select 1940-now desc, placeholder kosong `required`
- 4 conditional via `superRefine`

#### 8. Strategi Verifikasi

`pnpm check` 0 error, `pnpm lint` 0 error, `pnpm build` ada `build/index.html`, dev smoke di 1420 form conditional + /daftar filter + /statistik cards.

#### 9. Risiko

- Conditional 4 rule missed -> zod superRefine + $derived disable
- 38 provinsi typo -> Permendagri 2023/2024 const
- Tailwind v4 clash -> `@tailwindcss/vite`
- Port bentrok -> strictPort fail fast

## Daftar Task

### Task 1: Git init + first commit

- Tipe: light-fix
- Tujuan: git init, .gitignore SvelteKit+build+node_modules, commit AGENTS.md + PEDOMAN
- File: `.gitignore`, `README.md`
- Acceptance: `git log --oneline` 1 commit `chore: init`, branch main clean
- Dependensi: tidak ada
- Status: [x] done - 7f2d4e0

### Task 2: Scaffold SvelteKit minimal + TS strict + ESLint/Prettier + adapter-static + Vite 1420

- Tipe: frontend
- Tujuan: `pnpm dlx sv create . --template minimal --types ts` + `pnpm dlx sv add eslint prettier tailwindcss` + adapter-static fallback + vite 1420 + +layout.ts ssr false
- File: `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.prettierrc`, `src/routes/+layout.ts`, `src/app.html`, `src/app.css`
- Acceptance: `pnpm check` PASS, `pnpm lint` PASS, `pnpm build` -> `build/index.html`, `pnpm dev` 1420 strictPort
- Dependensi: Task 1
- Status: [x] done - pnpm check/build PASS, adapter-static 3.0.10, 1420 strictPort

### Task 3: Tailwind v4 + shadcn-svelte init + core components

- Tipe: frontend
- Tujuan: `pnpm dlx shadcn-svelte@latest init` (default neutral) + add button input label select radio-group card table dialog field badge separator skeleton textarea sonner
- File: `components.json`, `src/lib/utils.ts`, `src/lib/components/ui/*`, `src/app.css`, `src/routes/+layout.svelte`
- Acceptance: components ada, `pnpm check` PASS, Button/Input render tanpa error
- Dependensi: Task 2
- Status: [x] done - 14 components, tailwind 4.3.0, check PASS

### Task 4: Schema DB referensi + Types + Constants + Zod + Dummy TS + Store localStorage

- Tipe: frontend
- Tujuan: `types.ts`, `constants/provinces.ts` 38, `constants/options.ts`, `schemas/guest.ts` zod superRefine hp digit, `schemas/guest.sql`, `data/dummy.ts` 25, `stores/guests.svelte.ts` factory + localStorage
- File: `src/lib/types.ts`, `src/lib/constants/*`, `src/lib/schemas/guest.ts`, `src/lib/schemas/guest.sql`, `src/lib/data/dummy.ts`, `src/lib/stores/guests.svelte.ts`
- Acceptance: `pnpm check` PASS, zod tolak 4 invalid conditional, dummy 25 cover varian, store add persist localStorage
- Dependensi: Task 2 (paralel Task 3)
- Status: [x] done - zod 3.25.76, 25 dummy, store btpst_mock_visits

### Task 5: Form Buku Tamu 16 field + conditional + validasi digit

- Tipe: frontend
- Tujuan: `/+page.svelte` + `GuestForm.svelte` FieldGroup Select/RadioGroup $derived conditional error inline submit store toast reset
- File: `src/routes/+page.svelte`, `src/lib/components/guest/GuestForm.svelte`
- Acceptance: 16 field urut pedoman, 4 conditional jalan, error data-invalid/aria-invalid, hp 8-15 digit only, submit tambah store
- Dependensi: Task 3, Task 4
- Status: [x] done - 16 field, 4 conditional, hp digit, store toast

### Task 6: List/Table Tamu + Detail + Search/Filter

- Tipe: frontend
- Tujuan: `/daftar/+page.svelte` + `GuestTable.svelte` + `GuestDetail.svelte` Dialog search nama/instansi filter keperluan/gender pagination 10
- File: `src/routes/daftar/+page.svelte`, `src/lib/components/guest/GuestTable.svelte`, `src/lib/components/guest/GuestDetail.svelte`
- Acceptance: Table 25+entry, search/filter reaktif $derived, dialog full field Lainnya combined, empty state
- Dependensi: Task 5
- Status: [x] done - table 25+entry, search/filter reaktif

### Task 7: Statistik + Responsive + QA Gate

- Tipe: frontend
- Tujuan: `/statistik/+page.svelte` cards total/hari ini/by keperluan/by pendidikan, responsive a11y, final check
- File: `src/routes/statistik/+page.svelte`, `README.md`
- Acceptance: `pnpm check/build/lint` PASS, manual gate 8 poin lolos, minta approval user
- Dependensi: Task 6
- Status: [x] done - statistik cards total/hari ini/by keperluan, responsive, check/build/lint PASS

### Task 8 [DITUNDA]: Init Tauri v2 + config 1420

- Tipe: backend
- Tujuan: cargo tauri init, tauri.conf.json devUrl 1420 frontendDist ../build
- File: `src-tauri/*`
- Acceptance: `pnpm tauri dev` webview load 1420
- Dependensi: Gate Task 7 APPROVED
- Status: [ ] ditunda

### Task 9 [DITUNDA]: SQLite plugin + migrasi visits

- Tipe: backend
- Tujuan: tauri-plugin-sql, SQL CREATE TABLE visits, seed 25 dummy
- File: `src-tauri/src/db.rs`, `migrations/001_visits.sql`
- Acceptance: `buku-tamu.db` terbuat, SELECT return 25
- Dependensi: Task 8
- Status: [ ] ditunda

### Task 10 [DITUNDA]: IPC commands + ganti store ke invoke

- Tipe: backend
- Tujuan: add_visit list_visits search, store ganti invoke()
- File: `src-tauri/src/commands/*`, `src/lib/stores/guests.svelte.ts`
- Acceptance: form insert DB native, list fetch DB
- Dependensi: Task 9
- Status: [ ] ditunda

### Task 11 [DITUNDA]: Build bundle Windows + docs

- Tipe: backend
- Tujuan: pnpm tauri build installer
- File: `docs/*`
- Acceptance: .exe installer jalan
- Dependensi: Task 10
- Status: [ ] ditunda
