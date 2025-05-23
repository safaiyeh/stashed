# Stashed

An open-source alternative to Pocket — a Chrome extension to save, organize, and revisit web pages. Built as a monorepo with pnpm workspaces.

## Features

- 📌 Save the current page with one click
- 🗂️ View and manage your saved links in a modern popup UI
- 🏷️ Tag and organize your saved items (coming soon)
- ⚡ Fast and privacy-friendly
- 🧩 Built with [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Vite](https://vitejs.dev/)
- 🔐 Backend powered by [Supabase](https://supabase.com/) for data persistence
- 🔗 Seamless authentication between web app and extension

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

# Web App URL (use your deployed URL or localhost for development)
VITE_WEB_APP_URL=https://your-domain.com
```

#### Web App Environment Variables
Copy `apps/web/.env.example` to `apps/web/.env.local`:
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` with your values:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Chrome Extension ID (get this after loading your extension)
NEXT_PUBLIC_EXTENSION_ID=your-extension-id
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

#### Web app:
```bash
pnpm run dev:web
```

### 7. Load the extension in Chrome
1. Build the extension: `pnpm run build:extension`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `apps/extension/dist` folder
5. Copy the extension ID from the extension card
6. Update your web app's `.env.local` with the extension ID

### 8. Build for production
```bash
pnpm run build
```

## Authentication Flow

The app uses a seamless authentication system:

1. User clicks "Save" in the extension
2. If not authenticated, redirects to web app login
3. User logs in via magic link (Supabase Auth)
4. Web app sends session to extension via secure messaging
5. Extension can now make authenticated API calls

## Project Structure

```
├── packages/
│   └── shared/             # Shared TypeScript types
│       ├── src/types/      # Authentication types
│       └── package.json
│
├── apps/
│   ├── extension/          # Chrome extension (React, Vite, Tailwind)
│   │   ├── src/
│   │   │   ├── popup/      # Popup React app (UI)
│   │   │   ├── background/ # Background scripts
│   │   │   ├── content/    # Content scripts
│   │   │   ├── lib/        # Auth service, Supabase client
│   │   │   ├── config/     # Environment configuration
│   │   │   └── types/      # TypeScript types
│   │   ├── public/         # Static assets (manifest template)
│   │   └── dist/           # Build output (ignored by git)
│   │
│   └── web/                # Web app (Next.js, Tailwind)
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
- The extension manifest is generated from a template during build
- Environment variables are validated during build process
- Shared types ensure consistency between web app and extension

## Contributing

- Please use pnpm for all development tasks
- See the monorepo structure above for where to add new code
- Follow the existing authentication patterns when adding new features

## License

[MIT](LICENSE)

---

Made with ❤️ for the open web. 