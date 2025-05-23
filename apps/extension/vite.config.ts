import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

// Plugin to process manifest template
function manifestPlugin() {
  return {
    name: 'manifest-plugin',
    buildStart() {
      const env = loadEnv('', process.cwd(), '');
      const templatePath = resolve(__dirname, 'public/manifest.template.json');
      const outputPath = resolve(__dirname, 'public/manifest.json');
      
      try {
        const template = readFileSync(templatePath, 'utf-8');
        writeFileSync(outputPath, template);
      } catch (error) {
        console.warn('Could not process manifest template:', error.message);
      }
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !env[envVar]
  );

  if (missingEnvVars.length > 0) {
    const isCI = env.CI === 'true';
    const isBuild = process.argv.includes('build');
    
    if (!isCI && !isBuild) {
      const errorMessage = `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
        'Please create a .env file with these variables. See README.md for setup instructions.';
      throw new Error(errorMessage);
    }
  }

  return {
    root: 'src',
    plugins: [react(), manifestPlugin()],
    define: {
      'process.env': env
    },
    build: {
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'src/popup/index.html'),
          background: resolve(__dirname, 'src/background/index.ts'),
          login: resolve(__dirname, 'src/pages/login/index.html'),
        },
        output: {
          entryFileNames: '[name]/index.js',
          chunkFileNames: (chunkInfo) => {
            // Replace underscore prefixes to avoid Chrome extension issues
            const name = chunkInfo.name?.replace(/^_/, '') || 'chunk';
            return `chunks/${name}-[hash].js`;
          },
          assetFileNames: '[name]/[name][extname]',
          manualChunks: undefined,
        },
      },
      outDir: '../dist',
      emptyOutDir: true,
    },
    publicDir: '../public',
  };
}); 