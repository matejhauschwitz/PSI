# Frontend Dokumentace – Bookstore

## 📋 Přehled

Moderní React frontend pro e-commerce aplikaci prodeje knih. Aplikace je postavena na TypeScriptu s React 18 a obsahuje kompletní funkcionalitu pro nákup, správu profilu a administraci.

---

## 🛠️ Technologie

| Technologie | Verze | Účel |
|-------------|-------|------|
| **React** | 18.2.0 | UI framework |
| **TypeScript** | 5.2.2 | Type-safe JavaScript |
| **Vite** | 5.0.2 | Build tool a dev server |
| **React Router** | 6.20.0 | Routing a navigace |
| **Tailwind CSS** | 3.4.0 | Utility-first styling |
| **Axios** | 1.6.2 | HTTP požadavky |
| **Lucide React** | 0.546.0 | UI ikony |
| **React Hot Toast** | 2.6.0 | Notifikace |

---

## 📁 Struktura projektu

```
frontend/
├── src/
│   ├── App.tsx                 # Root komponenta
│   ├── main.tsx               # Entry point
│   ├── index.css              # Globální styly
│   │
│   ├── pages/                 # Stránky (page-level komponenty)
│   │   ├── HomePage.tsx
│   │   ├── BooksPage.tsx
│   │   ├── BookDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── OrderConfirmationPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── AdminPage.tsx
│   │
│   ├── components/            # Reusable UI komponenty
│   │   ├── Navbar.tsx
│   │   ├── HeroBanner.tsx
│   │   ├── BooksGrid.tsx
│   │   ├── BooksFilters.tsx
│   │   ├── BooksCarousel.tsx
│   │   ├── Cart.tsx
│   │   ├── CartItems.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── CommentsSection.tsx
│   │   ├── ShippingAddressForm.tsx
│   │   └── ... (další komponenty)
│   │
│   ├── services/              # API komunikace
│   │   ├── api.ts            # Axios instance, base API calls
│   │   └── adminService.ts   # Admin-specifické API operace
│   │
│   ├── context/              # React Context (state management)
│   │   └── CartContext.tsx   # Globální stav nákupního košíku
│   │
│   ├── hooks/                # Custom React hooks
│   │
│   ├── types/                # TypeScript definice a interfaces
│   │
│   └── i18n.ts (prototype) # Internationalizace
│
├── index.html                 # HTML vstupní bod
├── vite.config.ts            # Vite konfigurace
├── tsconfig.json             # TypeScript konfigurace
├── tailwind.config.js        # Tailwind CSS konfigurace
├── postcss.config.js         # PostCSS konfigurace
└── package.json              # Závislosti a scripts
```

---

## 🚀 Instalace a spuštění

### Development
```bash
npm install
npm run dev
```
Server se spustí na `http://localhost:3000`

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

---

## 🏗️ Architektura

### Stránky (Pages)
- **HomePage** – Úvodní stránka s bannerem a doporučeními
- **BooksPage** – Katalog knih s filtry a vyhledáváním
- **BookDetailPage** – Detail knihy s komentáři a recenzemi
- **CartPage** – Nákupní košík
- **OrderConfirmationPage** – Potvrzení objednávky
- **LoginPage** – Přihlášení
- **RegisterPage** – Registrace
- **ProfilePage** – Profil uživatele
- **AdminPage** – Admin dashboard (správa uživatelů, objednávek)

### Komponenty
Reusable komponenty pro UI prvky:
- Filtrování a zobrazení knih
- Formuláře (adresa, platba)
- Nákupní košík a shrnutí objednávky
- Komentáře a recenze

### Services
- **api.ts** – Centralizovaná komunikace s backend API
- **adminService.ts** – Admin endpoint volání

### State Management
- **CartContext** – Globální stav nákupního košíku (Context API)

---

## 🔌 API Komunikace

Axios instance je konfigurován v `services/api.ts` s:
- Base URL na backend API
- Default headers
- Error handling
- Token management

**Příklad:**
```typescript
// api.ts
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
})

// v komponentě
const response = await api.get('/books')
```

---

## 🎨 Styling

**Tailwind CSS** je primární styling framework:
- Utility-first přístup
- Responzivní design
- Custom konfiguraci v `tailwind.config.js`

**Ikony:** Lucide React (14 MB ikona sada)

---

## 📝 TypeScript

Projekt používá TypeScript ve striktním módu:
- Type checking při build (`tsc -b`)
- Všechny komponenty jsou typované
- Definice v `types/` složce

---

## 📦 Klíčové akce

| Akce | Komponenty |
|------|-----------|
| **Prohlížení knih** | HomePage, BooksPage, BooksGrid, BooksFilters |
| **Detail knihy** | BookDetailPage, CommentsSection |
| **Nákupní košík** | CartContext, Cart, CartItems, OrderSummary |
| **Checkout** | ShippingAddressForm, PaymentMethodSelector |
| **Uživatelský profil** | ProfilePage, ProfileFormHeader |
| **Admin panel** | AdminPage, adminService |

---

## 🔐 Autentizace

- Login/Register přes dedikované stránky
- Bearer token v Authorization headers
- Token storage (localStorage/sessionStorage)

---

## 🚦 Notifikace

Aplikace používá **React Hot Toast** pro uživatelské notifikace (úspěch, chyby, informace).

---

## 📱 Responsivní design

Tailwind CSS zajišťuje responzivnost na všech obrazovkách:
- Mobile-first přístup
- Breakpointy: sm, md, lg, xl

---

## 🔄 Vývojový workflow

1. **Komponenty** – Vytvárej v `components/`
2. **Stránky** – Vytvárej v `pages/`
3. **API** – Přidej volání v `services/api.ts`
4. **Typy** – Definuj v `types/`
5. **Hooks** – Custom logika v `hooks/`
6. **Routing** – Přidej v `App.tsx`

---

## ⚠️ Důležité poznámky

- Backend API musí být spuštěn na portu 5000
- CORS musí být povoleno na backendu
- Vite server běží na portu 3000 (lze změnit v `vite.config.ts`)

---

## 📚 Více informací

Viz [README.md](./README.md) v root složce frontend.
