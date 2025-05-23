<div align="center">
  <img src="logo.png" alt="Stashed Logo" width="128" height="128">
  <h1>Stashed</h1>
</div>

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

### 3. Set up Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Set up your database schema (tables for saved items, user authentication, etc.)

### 4. Set up environment variables

#### Extension Environment Variables
Copy `apps/extension/.env.example` to `apps/extension/.env`:
```bash
cp apps/extension/.env.example apps/extension/.env
```

Edit `apps/extension/.env` with your values:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Build the shared package
```bash
pnpm run build:shared
```

### 6. Develop locally

#### Extension:
```bash
pnpm run dev:extension
```

#### Web app (optional, for dashboard or landing page):
```bash
pnpm run dev:web
```

### 7. Load the extension in Chrome
1. Build the extension: `pnpm run build:extension`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `apps/extension/dist` folder

### 8. Build for production
```bash
pnpm run build
```

## Authentication Flow

Authentication is now handled entirely within the extension:

1. User clicks "Sign in" in the extension popup
2. A new tab opens with the extension's login page
3. User logs in via magic link (Supabase Auth)
4. The extension stores the session and can now make authenticated API calls

No communication with the web app is required for authentication.

## Project Structure

```
├── packages/
│   └── shared/             # Shared TypeScript types
│       ├── src/types/      # Shared types (optional, not required for extension)
│       └── package.json
│
├── apps/
│   ├── extension/          # Chrome extension (React, Vite, Tailwind)
│   │   ├── src/
│   │   │   ├── popup/      # Popup React app (UI)
│   │   │   ├── background/ # Background scripts
│   │   │   ├── pages/      # Full-page login
│   │   │   ├── lib/        # Auth service, Supabase client
│   │   │   ├── config/     # Environment configuration
│   │   │   └── types/      # TypeScript types
│   │   ├── public/         # Static assets (manifest template)
│   │   └── dist/           # Build output (ignored by git)
│   │
│   └── web/                # Web app (Next.js, Tailwind) (optional)
│       ├── src/            # Next.js source files
│       ├── public/         # Static assets
│       └── package.json
│
├── pnpm-workspace.yaml     # PNPM workspace configuration
├── package.json            # Monorepo root
└── README.md
```

## Development Notes

- All commands should be run from the root of the repository
- Only use pnpm for dependency management and scripts
- The extension manifest is automatically generated from `manifest.template.json` during build
- Environment variables are validated during build process
- Shared types are optional for the extension

## Contributing

- Please use pnpm for all development tasks
- See the monorepo structure above for where to add new code

## License

[MIT](LICENSE)

---

Made with ❤️ for the open web. 