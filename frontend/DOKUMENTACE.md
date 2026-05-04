# Frontend – Dokumentace

Frontend e-commerce aplikace pro prodej knih. Postaven na **React 18 + TypeScript + Vite**, stylovaný pomocí **Tailwind CSS**.

---

## Technologický stack

| Technologie | Verze | Účel |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 (strict) | Typová bezpečnost |
| Vite | 5 | Build tool, dev server (port 3000) |
| React Router | 6 | Klientské routování |
| Tailwind CSS | 3 | Utility-first styling |
| Axios | 1.6 | HTTP klient |
| Lucide React | – | SVG ikony |
| React Hot Toast | 2.6 | Toast notifikace |
| Vitest + RTL | 4 | Unit a integration testy |

---

## Spuštění

```bash
# Instalace závislostí
npm install

# Dev server (http://localhost:3000)
npm run dev

# Produkční build
npm run build

# Testy
npm test

# Testy s coverage reportem
npm run coverage
```

Proměnná prostředí:

```
VITE_API_URL=https://<backend-url>   # výchozí: http://localhost:5118
```

---

## Struktura projektu

```
frontend/
├── index.html                  # HTML vstupní bod (lang=cs, title "Knihorny")
├── vite.config.ts              # Vite + Vitest konfigurace
├── tsconfig.json               # TypeScript (strict, ES2020, react-jsx)
├── tailwind.config.js          # Tailwind – content scan
├── postcss.config.js           # PostCSS – tailwindcss + autoprefixer
├── package.json
└── src/
    ├── main.tsx                # React.StrictMode → <App />
    ├── App.tsx                 # Router, auth guard, routes
    ├── index.css               # Tailwind directives + custom utilities
    ├── env.d.ts                # Vite env type declaration
    ├── types/index.ts          # Sdílené TypeScript interfaces
    ├── test/setup.ts           # Vitest setup (jest-dom, cleanup)
    ├── context/
    │   └── CartContext.tsx     # Globální stav košíku (localStorage)
    ├── hooks/                  # Custom React hooks
    ├── services/               # API komunikace (Axios)
    ├── pages/                  # Page-level komponenty
    └── components/             # Reusable UI komponenty
```

---

## Architektura aplikace

```mermaid
graph TB
    MAIN[main.tsx\nReact.StrictMode]
    MAIN --> APP[App.tsx\nCartProvider + BrowserRouter]

    APP --> AUTH{useAuth\nisAuthenticated?}
    APP --> ROUTER[React Router v6]

    subgraph PAGES["Pages"]
        PUB[Veřejné\nHome · Books · BookDetail\nLogin · Register · Cart\nOrderConfirmation]
        PROT[Chráněné\nFavourites · Profile]
        ADMIN_P[Admin\nAdminPage]
    end

    ROUTER --> PUB
    AUTH -->|isAuthenticated| PROT
    AUTH -->|isAuthenticated + isAdmin| ADMIN_P

    subgraph STATE["State"]
        CART[CartContext\nlocalStorage]
        HOOKS[Custom Hooks\nuseAuth · useBookDetail\nuseBooksFilter · ...]
    end

    subgraph SERVICES["Services"]
        API[api.ts\nAxios instance\nBearer JWT]
        ADMIN_SVC[adminService.ts]
    end

    PAGES --> HOOKS
    HOOKS --> SERVICES
    SERVICES -->|HTTP| BACKEND[(Backend API)]
    CART -.->|persists| LS[(localStorage)]
```

---

## Routování

Definováno v [src/App.tsx](src/App.tsx). Chráněné routy přesměrovávají na `/login`.

```mermaid
flowchart LR
    ROOT["/"] --> HOME[HomePage]
    BOOKS["/books"] --> BOOKSPAGE[BooksPage]
    BOOKID["/books/:id"] --> BOOKDETAIL[BookDetailPage]
    LOGIN["/login"] --> LOGINPAGE[LoginPage]
    REGISTER["/register"] --> REGPAGE[RegisterPage]
    CART["/cart"] --> CARTCOMP[Cart]
    CONFIRM["/order-confirmation"] --> ORDERCONF[OrderConfirmationPage]

    FAV["/favourites"] -->|isAuthenticated| FAVPAGE[FavouritesPage]
    FAV -->|not auth| REDIR_L[redirect /login]

    PROFILE["/profile"] -->|isAuthenticated| PROFILEPAGE[ProfilePage]
    PROFILE -->|not auth| REDIR_L2[redirect /login]

    ADMIN_R["/admin"] -->|isAuthenticated + isAdmin| ADMINPAGE[AdminPage]
    ADMIN_R -->|not auth / not admin| REDIR_L3[redirect /login]
```

---

## Datové typy (`src/types/index.ts`)

```mermaid
classDiagram
    class User {
        +id?: number
        +name: string
        +userName: string
        +email?: string
        +address?: Address
        +billingAddress?: Address
        +isMale?: boolean
        +birthDay?: string
        +processData?: boolean
        +favouriteGerners?: string[]
        +role?: number
    }

    class Address {
        +streetAddress?: string
        +city?: string
        +zip?: string
        +country?: string
    }

    class Book {
        +id: number
        +title: string
        +author: string
        +genre?: string
        +publicationYear?: number
        +rating?: number
        +coverImageUrl?: string
        +pageCount?: number
        +totalRatings?: number
        +description?: string
        +price?: number
    }

    class Comment {
        +id?: number
        +bookId: number
        +comment: string
        +rating: number
        +creatorUserName?: string
        +createdAt?: string
    }

    class Order {
        +id?: number
        +userId?: number
        +books?: Book[]
        +bookIds?: number[]
        +status?: string
        +paymentMethod?: string
        +totalPrice?: number
        +createdAt?: string
    }

    class BooksResponse {
        +totalRecords: number
        +totalPages: number
        +page: number
        +pageSize: number
        +books: Book[]
    }

    User --> Address : address
    User --> Address : billingAddress
    Order --> Book : books
    BooksResponse --> Book : books
```

---

## Stav košíku (`CartContext`)

Soubor: [src/context/CartContext.tsx](src/context/CartContext.tsx)

Ukládá košík do `localStorage` a obnoví ho při načtení stránky.

```mermaid
stateDiagram-v2
    [*] --> Init : mount
    Init --> Loaded : načti z localStorage

    Loaded --> Loaded : addToCart(book)\n– deduplikace dle id
    Loaded --> Loaded : removeFromCart(bookId)
    Loaded --> Empty : clearCart()

    Loaded --> [*] : persist do localStorage

    note right of Loaded
        cartItems: Book[]
        cartCount: number
        getCartTotal(): number
    end note
```

---

## Hooky (`src/hooks/`)

| Hook | Popis |
|---|---|
| `useAuth` | Inicializuje auth stav z JWT v localStorage; rozlišuje role (0=user, 1=admin) |
| `useBookDetail` | Načte detail knihy + komentáře + stav oblíbené; exponuje toggle a addComment |
| `useBooksFilter` | Stránkovaný seznam knih s filtry (title, genre, cenové rozmezí) |
| `useFavourites` | Načte oblíbené; optimistické odebrání položky |
| `useFeaturedBooks` | Načte prvních 50 knih a vrátí top 6 dle ratingu |
| `useHomeStats` | Paralelně načte statistiky (knihy, žánry, uživatelé, bestseller) pro úvodní stránku |

```mermaid
graph LR
    useAuth -->|"isAuthenticated · loading\nuserRole · isAdmin"| APP[App.tsx]
    useBookDetail -->|"book · comments\nisFavourite · loading"| BDP[BookDetailPage]
    useBooksFilter -->|"booksResponse · page\ngenres · filtry"| BP[BooksPage]
    useFavourites -->|"booksResponse\nhandleRemoveFavourite"| FP[FavouritesPage]
    useFeaturedBooks -->|"top 6 knih dle ratingu"| BC[BooksCarousel]
    useHomeStats -->|"totalBooks · totalGenres\ntotalUsers · bestseller"| SB[StatsBanner + HeroBanner]
```

---

## Services (`src/services/`)

### `api.ts`

Centrální Axios instance s automatickým přidáváním JWT tokenu:

```mermaid
sequenceDiagram
    participant COMP as Komponenta / Hook
    participant SVC as api.ts
    participant LSTORE as localStorage
    participant BE as Backend API

    COMP->>SVC: bookService.getBooks(...)
    SVC->>LSTORE: getItem('jwt_token')
    LSTORE-->>SVC: token
    SVC->>BE: GET /api/books?...\nAuthorization: Bearer token
    BE-->>SVC: BooksResponse JSON
    SVC-->>COMP: data
```

| Service | Metody |
|---|---|
| `authService` | `register(user)` · `login(credentials)` → uloží JWT · `logout()` → smaže JWT · `isAuthenticated()` |
| `bookService` | `getBooks(page, pageSize, title, genre, minPrice, maxPrice)` · `getGenres()` · `getBook(id)` · `getFavourites()` · `addFavourite(id)` · `removeFavourite(id)` |
| `userService` | `getUserDetail()` · `updateUser(user)` |
| `commentService` | `getComments(bookId)` · `addComment(comment)` |
| `orderService` | `createOrder(order)` · `getOrders()` |

### `adminService.ts`

CRUD operace dostupné pouze administrátorům:

| Oblast | Metody |
|---|---|
| Users | `getUsers()` · `createUser(user)` · `updateUser(id, user)` · `deleteUser(id)` |
| Orders | `getOrders()` · `updateOrderStatus(id, status)` · `deleteOrder(id)` |
| Books | `getBooks()` · `createBook(book)` · `updateBook(id, book)` · `deleteBook(id)` |
| Audit logs | `getAuditLogs(logType?, userName?, startDate?, endDate?)` |

---

## Stránky (`src/pages/`)

```mermaid
graph TD
    HOME[HomePage\nHeroBanner + StatsBanner\n+ BooksCarousel]
    BOOKS[BooksPage\nBooksFilters sidebar\n+ BooksGrid + pagination]
    DETAIL[BookDetailPage\nBookDetailHeader\n+ CommentsSection]
    LOGIN[LoginPage\nsplit-panel layout]
    REGISTER[RegisterPage\nsplit-panel layout]
    FAV[FavouritesPage\nFavouritesBooksGrid]
    PROFILE[ProfilePage\nPersonal · Adresy\nŽánry · Objednávky]
    ORDERCONF[OrderConfirmationPage\nOrderSummary]
    ADMIN[AdminPage\n4 záložky]
    CART_PAGE[Cart\nCartItems + OrderSummary\nShipping + Payment]

    HOME -->|kliknutí na knihu| DETAIL
    BOOKS -->|kliknutí na knihu| DETAIL
    DETAIL -->|Add to cart| CART_PAGE
    CART_PAGE -->|order submit| ORDERCONF
    LOGIN -->|success| HOME
    REGISTER -->|success| LOGIN
```

### AdminPage – záložky

```mermaid
flowchart LR
    ADMIN[AdminPage]
    ADMIN --> TAB1[Users\nCRUD tabulka\n+ UserForm modal]
    ADMIN --> TAB2[Orders\nstatus inline změna\n+ smazání]
    ADMIN --> TAB3[Books\nCRUD tabulka\n+ BookForm modal]
    ADMIN --> TAB4[Audit Logs\nfiltr logType · userName · datum\n+ detail modal]
```

### ProfilePage – sekce

```mermaid
flowchart LR
    PROFILE[ProfilePage]
    PROFILE --> S1[ProfileHeader\navatár · jméno · username]
    PROFILE --> S2[ProfileFormHeader\nosobní data + GDPR]
    PROFILE --> S3[AddressSection\nDoručovací adresa]
    PROFILE --> S4[AddressSection\nFakturační adresa]
    PROFILE --> S5[GenreSelector\noblíbené žánry]
    PROFILE --> S6[Historie objednávek\nstav + položky + cena]
```

---

## Komponenty (`src/components/`)

### Navigace a layout

| Komponenta | Popis |
|---|---|
| `Navbar` | Sticky top navbar; auth-conditional linky (Oblíbené, Profil, Admin); badge s počtem položek v košíku |
| `Modal` | Generický accessible modal; zavírání přes ESC; konfigurovatelná šířka |

### Úvodní stránka

| Komponenta | Popis |
|---|---|
| `HeroBanner` | Full-width hero; tmavý levý panel + přebal bestselleru vpravo; CTA reagují na přihlášení |
| `StatsBanner` | 3 sloupce: celkem knih · žánrů · uživatelů |
| `BooksCarousel` | Responsivní karusel top-rated knih; breakpointy: 1 / 2 / 4 knih |

### Katalog knih

| Komponenta | Popis |
|---|---|
| `BooksGrid` | Mřížka karet knih; kompaktní paginator (prev · čísla stránek · next) |
| `BooksFilters` | Sidebar: fulltext search · seznam žánrů s vyhledáváním · min/max cena |

### Detail knihy

| Komponenta | Popis |
|---|---|
| `BookDetailHeader` | Přebal + metadata + cena + tlačítka košík / oblíbené |
| `CommentsSection` | Seznam recenzí s hvězdičkovým hodnocením; formulář pro přidání (jen přihlášení) |
| `FavouritesBooksGrid` | Mřížka oblíbených; hover odhalí tlačítko pro odebrání |

### Checkout

```mermaid
flowchart TB
    CART_COMP[Cart]
    CART_COMP --> CI[CartItems\nseznám knih + remove]
    CART_COMP --> OS[OrderSummary\nmezisoučet · doprava · celkem]
    CART_COMP --> SAF[ShippingAddressForm\nulice · město · PSČ · země]
    CART_COMP --> PMS[PaymentMethodSelector\nOnlineCard +1%\nTransfer zdarma\nOnDelivery +50 Kč]

    CART_COMP -->|validateProfile| CHECK{Profil\nkompletní?}
    CHECK -->|ano| ORDER[orderService.createOrder]
    ORDER --> OC[OrderConfirmationPage]
    CHECK -->|ne| WARN[upozornění\na redirect na profil]
```

### Profil a admin formuláře

| Komponenta | Popis |
|---|---|
| `ProfileHeader` | Avatar (iniciály) + jméno + username + e-mail |
| `ProfileFormHeader` | Osobní data: jméno, e-mail, pohlaví, narozeniny, GDPR souhlas |
| `AddressField` | Jeden popsaný textový input pro adresní pole |
| `AddressSection` | Karta se 4× `AddressField` (doručovací / fakturační adresa) |
| `GenreSelector` | Tag-cloud přepínatelných žánrů; vybrané = modrá výplň |
| `UserForm` | Admin formulář: create/edit user (username, jméno, e-mail, heslo při vytváření, role) |
| `BookForm` | Admin formulář: create/edit book (title, subtitle, autor, žánr, popis, ISBN10/13, cover URL, cena) |

---

## Testování

Každá stránka a většina komponent mají vlastní `.test.tsx` soubor vedle zdrojového souboru. Testy jsou psány pomocí **Vitest + React Testing Library**.

### Coverage prahy (`vite.config.ts`)

| Metrika | Práh |
|---|---|
| Lines | 90 % |
| Functions | 90 % |
| Statements | 90 % |
| Branches | 80 % |

Z coverage jsou vyloučeny: `main.tsx`, `vite-env.d.ts`, `src/types/**`, testovací soubory, `index.css`.

Coverage reporty: `text` (terminal) · `json` · `html` · `cobertura` (pro CI).

Setup soubor [`src/test/setup.ts`](src/test/setup.ts) registruje `@testing-library/jest-dom` matchers a po každém testu volá `cleanup()`.

---

## Autentizace a autorizace

```mermaid
sequenceDiagram
    participant USER as Uživatel
    participant LP as LoginPage
    participant SVC as authService
    participant LS as localStorage
    participant APP as App.tsx / useAuth

    USER->>LP: Zadá přihlašovací údaje
    LP->>SVC: login(credentials)
    SVC->>LS: setItem('jwt_token', token)
    SVC-->>LP: LoginResponse { token }
    LP->>APP: navigate('/')
    APP->>LS: getItem('jwt_token')
    APP->>APP: dekóduje role z JWT
    APP-->>APP: isAuthenticated=true\nisAdmin=(role===1)
```

JWT token je ukládán do `localStorage` pod klíčem `jwt_token`. Request interceptor v `api.ts` ho automaticky přidává do každého požadavku jako `Authorization: Bearer <token>`. Odhlášení (`authService.logout()`) token z localStorage odstraní.

