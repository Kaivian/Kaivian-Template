# Kaivian-Template

A professional full-stack application scaffolder and template. Use the `kailib` CLI to generate a ready-to-run monorepo with a Node.js server and a Next.js (React) client, pre-configured with Heroui UI components.

## Contents
- What is Kaivian-Template
- Prerequisites
- Installation (CLI)
- Usage
  - Commands
  - Options
  - Examples
- File Structure (Template Constructor)
- Generated Project Scripts
- Development (Contributing)
- Troubleshooting
- License

## What is Kaivian-Template
Kaivian-Template provides a batteries-included starting point for modern web apps:
- Backend: Node.js server workspace
- Frontend: Next.js + React client workspace
- UI: [Heroui](https://heroui.com/)
- Monorepo setup via npm workspaces
- Sensible defaults and DX improvements

## Prerequisites
- Node.js >= 18
- npm >= 9

You can verify your versions:
```powershell
node -v
npm -v
```

## Installation (CLI)
This repository contains the CLI and templates. To use it locally:

1) Clone the repo:
```powershell
git clone https://github.com/Kaivian/Kaivian-Template.git
cd Kaivian-Template
```

2) Install dependencies and link the CLI:
```powershell
npm install
npm link
```
This will make the `kailib` command available globally on your machine.

To remove later: `npm unlink -g kailib` (from anywhere) and optionally `npm unlink` in the repo.

## Usage
Initialize a new application from the default template:
```powershell
kailib init my-app
```
This creates a `my-app` folder. If you run inside an existing empty folder, you can omit the name:
```powershell
mkdir my-app; cd my-app
kailib init
```

After initialization:
```powershell
cd my-app
npm install
npm run dev
```

### Commands
- `kailib init [app-name] [--template default] [--force]`
  - Create a new app from a template.

### Options
- `--template <name>`: Template to use. Defaults to `default`.
- `--force`: Allow using a non-empty target directory (existing contents will be cleared).

### Examples
- Use default template into a new folder:
  ```powershell
  kailib init acme-app
  ```
- Force init into current directory (dangerous; clears files):
  ```powershell
  kailib init . --force
  ```
- Specify a template explicitly:
  ```powershell
  kailib init blog --template default
  ```

## File Structure (Template Constructor)
The `default` template is a monorepo that looks like this:
```
<app-root>/
├─ LICENSE
├─ package.json           # npm workspaces and scripts (dev/build/start)
├─ package-lock.json
├─ server/                # Node.js server workspace
│  ├─ package.json
│  ├─ src/
│  │  └─ ...             # server source code (APIs, services, seed scripts)
│  └─ .env.example       # server environment example
└─ client/                # Next.js + React client workspace
   ├─ package.json
   ├─ app/                # Next.js App Router pages (layout.tsx, page.tsx, etc.)
   ├─ components/         # Shared UI components (e.g., theme-switch)
   ├─ public/             # Static assets
   ├─ config/             # App configuration (e.g., site.ts)
   └─ eslint.config.mjs
```
Notes:
- `node_modules` are intentionally not copied from templates during scaffolding.
- The root workspace scripts orchestrate both `server` and `client` concurrently.

## Generated Project Scripts
From the generated app root (e.g., `my-app/`):
- `npm run dev`: Run server and client in parallel with live reload.
- `npm run build`: Build server and then client.
- `npm start`: Start server and client in production mode (expects prior build).

You can also operate within each workspace individually using `-w`:
```powershell
npm run dev -w server
npm run dev -w client
```

## Development (Contributing)
- This repo is the CLI + templates. Update `templates/default/*` to evolve the scaffold.
- The CLI code lives in `cli.js`. Usage summary is printed when running without `init`.
- When changing the template, test locally by running:
  ```powershell
  npm link
  kailib init test-app --template default --force
  ```
- The CLI avoids copying any `node_modules` directories from templates.

## Troubleshooting
- Command not found: `kailib`
  - Ensure `npm link` succeeded and your npm global bin directory is on PATH.
- Permission issues on Windows
  - Run the terminal as Administrator or use a shell with the right privileges.
- Init fails because the directory is not empty
  - Use `--force` to allow clearing existing contents (be sure you want that!).
- Wrong Node/npm version
  - Check versions and upgrade to meet prerequisites.

## License
MIT © 2025 Thế Lực
