# Stashed

An open-source alternative to Pocket — a Chrome extension to save, organize, and revisit web pages. Built with React, Tailwind CSS, and Vite.

## Features

- 📌 Save the current page with one click
- 🗂️ View and manage your saved links in a modern popup UI
- 🏷️ Tag and organize your saved items (coming soon)
- ⚡ Fast, privacy-friendly, and works offline (data stored locally)
- 🧩 Built with [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Vite](https://vitejs.dev/)

## Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/safaiyeh/stashed.git
cd stashed
```

### 2. Install dependencies
```bash
npm install
```

### 3. Develop locally
```bash
npm run dev
```
- Open `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked" and select the `dist` folder after building

### 4. Build for production
```bash
npm run build
```
- The extension will be output to the `dist` directory

## Project Structure

```
├── src/
│   ├── popup/        # Popup React app (UI)
│   ├── background/   # Background scripts
│   ├── content/      # Content scripts
│   ├── types/        # TypeScript types
│   └── index.css     # Tailwind CSS entry
├── public/           # Static assets (manifest, icons)
├── dist/             # Build output (ignored by git)
├── vite.config.ts    # Vite configuration
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please open issues or pull requests for features, bug fixes, or suggestions.

## License

[MIT](LICENSE)

---

Made with ❤️ for the open web. 