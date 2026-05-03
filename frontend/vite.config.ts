/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  test: {
    // Simuluje prostředí prohlížeče
    environment: 'jsdom',
    // Globální proměnné jako 'describe', 'it', 'expect' (nemusíš je všude importovat)
    globals: true,
    // Cesta k souboru, který nastaví matchery (např. toBeInTheDocument)
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8', // Rychlejší než istanbul
      reporter: ['text', 'json', 'html', 'cobertura'], // 'html' vytvoří přehledný report ve složce /coverage
      include: ['src/**/*'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/types/**', // Typy nemají logiku k testování
        '**/*.test.{ts,tsx}', // Netestovat samotné testy
        '**/*.d.ts',
        'src/index.css',
      ],
      // Zde nastavujeme tvůj požadavek na 90 %
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
})