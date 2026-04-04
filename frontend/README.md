# Frontend - React + TypeScript + Vite

Webový frontend pro Knihovnu - aplikaci pro správu a objednávání knih.

## 🚀 Technologie

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (fast!)
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **CSS** - Styling (bez frameworku pro jednoduchost)

## 📋 Nastavení

### Předpoklady
- Node.js 16+
- npm nebo yarn

### Instalace

```bash
cd frontend
npm install
```

### Spuštění v dev módu

```bash
npm run dev
```

Aplikace se otevře na `http://localhost:3000`

### Build pro produkci

```bash
npm run build
```

Output bude v `dist/` složce.

### Environment

1. Zkopíruj `.env.example` na `.env`
2. Nastav `VITE_API_URL` na URL tvého backendu (default: `http://localhost:5118`)

```bash
cp .env.example .env
```

## 📁 Struktura projektu

```
frontend/
├── src/
│   ├── components/        # React komponenty (Navbar, apod.)
│   ├── pages/            # Page komponenty (Login, Books, apod.)
│   ├── services/         # API komunikace (authService, bookService, atd.)
│   ├── types/            # TypeScript interfaces (User, Book, atd.)
│   ├── hooks/            # Custom hooks (useAuth, apod.)
│   ├── App.tsx           # Hlavní komponenta s routingem
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML shell
├── vite.config.ts        # Vite konfiguraci
├── tsconfig.json         # TypeScript konfiguraci
├── .env.example          # Template pro environment variables
└── package.json          # Dependencies
```

## 🔧 Vývoj

### Přidání nové stránky

1. Vytvoř nový soubor v `src/pages/MyPage.tsx`
2. Přidej route do `src/App.tsx`:

```tsx
<Route path="/mypage" element={<MyPage />} />
```

3. Přidej link do `src/components/Navbar.tsx` (pokud chceš v menu)

### Přidání API call

Využívej service z `src/services/api.ts`:

```tsx
import { bookService } from '../services/api'

// V komponentě:
const books = await bookService.getBooks()
```

### Authentication

Aplikace automaticky přidává JWT token z `localStorage` do všech requestů.

Pro přihlášení:

```tsx
import { authService } from '../services/api'

const token = await authService.login(userName, password)
```

## 📚 API Reference

Viz [backend README](../api/README.md) nebo [API dokumentace](../api/api/SPI.http)

## 🐛 Troubleshooting

### Connecting to backend

Ujisti se, že:
1. Backend běží na správné URL (`http://localhost:5118`)
2. `.env` má správný `VITE_API_URL`
3. Backend má povolený CORS

```typescript
// Kontrolní co je nastaveno
console.log(import.meta.env.VITE_API_URL)
```

### Port je již используется

```bash
npm run dev -- --port 3001
```

## 📝 Další kroky

- [ ] Implementace BooksPage s filtrováním
- [ ] Přidání komponent pro karty knih
- [ ] Nákupní košík
- [ ] Checkout proces
- [ ] User profil a editace
- [ ] Responsivní design
- [ ] Testing (Jest, React Testing Library)
