# Stashed

An open-source alternative to Pocket — a Chrome extension to save, organize, and revisit web pages. Built as a monorepo with pnpm workspaces.

## Features

- 📌 Save the current page with one click
- 🗂️ View and manage your saved links in a modern popup UI
- 🏷️ Tag and organize your saved items (coming soon)
- ⚡ Fast and privacy-friendly
- 🧩 Built with [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Vite](https://vitejs.dev/)
- 🔐 Backend powered by [Supabase](https://supabase.com/) for data persistence

## Getting Started

### 1. Install pnpm
If you don't have pnpm, install it globally:
```bash
npm install -g pnpm
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Set up environment variables
- For the extension, copy `apps/extension/.env.example` to `apps/extension/.env` and fill in your Supabase credentials.
- For the web app, set up your environment variables as needed for Next.js.

### 4. Develop locally
#### Extension:
```bash
pnpm run dev:extension
```
#### Web app:
```bash
pnpm run dev:web
```

### 5. Build for production
```bash
pnpm run build
```

## Notes
- All commands should be run from the root of the repository.
- Only use pnpm for dependency management and scripts.
- Remove any `node_modules` or lockfiles from subdirectories if present.

## Project Structure

```
├── apps/
│   ├── extension/           # Chrome extension (React, Vite, Tailwind)
│   │   ├── src/
│   │   │   ├── popup/      # Popup React app (UI)
│   │   │   ├── background/ # Background scripts
│   │   │   ├── content/    # Content scripts
│   │   │   ├── types/      # TypeScript types
│   │   │   └── index.css   # Tailwind CSS entry
│   │   ├── public/         # Static assets (manifest, icons)
│   │   ├── dist/           # Build output (ignored by git)
│   │   ├── vite.config.ts  # Vite configuration
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   └── package.json
│   │
│   └── web/                # Web app (Next.js, Tailwind)
│       ├── src/            # Next.js source files
│       ├── public/         # Static assets
│       ├── next.config.js  # Next.js configuration
│       └── package.json
│
├── pnpm-workspace.yaml     # PNPM workspace configuration
├── package.json            # Monorepo root
└── README.md
```

## Contributing

- Please use pnpm for all development tasks.
- See the monorepo structure above for where to add new code.

---

For more details, see the documentation in each app's directory.

## License

[MIT](LICENSE)

---

Made with ❤️ for the open web. 