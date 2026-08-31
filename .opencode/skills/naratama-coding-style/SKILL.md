---
name: naratama-coding-style
description: Mandatory coding style for project. Use when writing, editing, or reviewing ANY code in this project. Enforces arrow functions only, no ES6 classes, strict TypeScript typing, factory functions/closures for state, AbortController cleanup, pnpm-only package commands, and the plan-first mode execution rule.
---

# Coding Style (Non-Negotiable)

## 1. Functional & Arrow Functions Only
- **NO `class` syntax. NO `this` binding. NO old-style `function` declarations.**
- State encapsulation via factory functions, closures, plain objects, module closures:

```ts
// ✅ CORRECT
const createMap = (config: MapConfig): MapInstance => {
  const state: MapState = { zoom: 12 };
  return { getZoom: (): number => state.zoom, destroy: (): void => { /* ... */ } };
};

// ❌ WRONG: class Map { ... } / function createMap() { ... }
```

## 2. TypeScript Strict Mode & Clean Code
- `tsconfig.json` → `"strict": true`
- ALWAYS type parameters, return values, state objects, DOM selectors:

```ts
const btn = document.querySelector<HTMLButtonElement>('#submit-btn');
const handler = (e: MouseEvent): void => { /* ... */ };
```

- Define `type`/`interface` for all data structures & state
- Single-responsibility pure modules

## 3. DOM & Events
- Native Web APIs only (`addEventListener`, `createElement`, `querySelector`), wrapped in clean functional helpers
- ALWAYS clean up listeners — prefer `AbortController` signals in dynamic components:

```ts
const createComponent = (container: HTMLElement) => {
  const controller = new AbortController();
  container.addEventListener('click', onClick, { signal: controller.signal });
  return { destroy: (): void => controller.abort() };
};
```

- Map/component instances MUST be destroyed/cleaned when removed from DOM (memory leaks)

## 4. Package Manager
- **pnpm ONLY**: `pnpm add`, `pnpm add -D`, `pnpm run dev`, `pnpm build`, `pnpm dlx`
- Never commit secrets; never log keys/tokens

## 5. Mode Execution Rule (Plan First)
- New project / complex system feature → **DO NOT jump into code**
- First produce a comprehensive Planning Markdown Document: file structure, state management flow, module definitions, DOM interaction plan
- WAIT for explicit user confirmation before implementing code

## 6. Security in Code
- NEVER use localStorage/sessionStorage for tokens
- EVERY fetch → `{ credentials: 'include' }` (no manual token headers)

## 7. Anti-AI Slop (Wajib untuk Semua Output WRITE)

- DILARANG: em-dash `—` (U+2014), en-dash `–` (U+2013), bullet dekoratif `•`, ellipsis tunggal `…`, emoticon `:) :D ;)`, emoji, atau dekorasi Unicode sejenis di kode, komentar, markdown, maupun commit message — KECUALI user minta eksplisit atau karakter adalah data konten yang memang diperlukan.
- Ganti dengan hyphen-minus `-` (U+002D) dan `...` (tiga titik ASCII).
- Gaya bahasa langsung, faktual, tanpa hiperbola. Jangan sisipkan frasa generik AI.
- Pelanggaran = `MINOR` untuk docs/komentar, `MAJOR` untuk kode/commit. `@doc-writer` boleh pakai emoji/emoticon hanya jika user minta eksplisit.