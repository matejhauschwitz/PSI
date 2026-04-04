# 📚 Bookstore

> **Semestrální projekt – PSI**

## 👥 Kontributoři

- **Jiří Šeps**
- **Vojtěch Gerö**
- **Matěj Hauschwitz**

## 🚀 Spuštění projektu

### ⚡ Spusť VŠECHNO najednou

#### Na **Windows** (PowerShell):
```powershell
.\start-dev.ps1
```

Otevře ti **3 nová okna** s:
- MySQL (Docker)
- Backend (.NET)
- Frontend (React)

#### Na **Linux/Mac** (Make):
```bash
make dev
```

Nebo jednotlivě:
```bash
make docker    # MySQL
make backend   # .NET
make frontend  # React
```

---

### 🔧 Manuální spuštění

#### Backend (ASP.NET Core API)

```bash
cd api/api
dotnet run
```

Backend: `http://localhost:5118`

Detaily: Viz [Backend README](./api/README.md)

#### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`

Detaily: Viz [Frontend README](./frontend/README.md)

#### Docker (MySQL)

```bash
cd api
docker compose up -d
```

MySQL: `localhost:5006`

---

## 📋 Požadavky

### Backend
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) nebo Docker

### Frontend
- [Node.js 16+](https://nodejs.org/)
- npm nebo yarn

---

## 🔧 Nastavení

### Backend

1. Přejděte do `api/api`
2. Zkopírujte `.env.example` na `.env`
3. Upravte `.env` s vašimi hodnotami:
   ```
   JWT_SECRET_KEY=your_secret_key_here
   ```
4. Upravte `appsettings.Development.json` s databázovým connection stringem
5. Spusťte migrations:
   ```bash
   dotnet ef database update
   ```

### Frontend

1. Přejděte do `frontend`
2. Zkopírujte `.env.example` na `.env`
3. Upravte `.env` s API URL (pokud backend neběží na defaultní adrese):
   ```
   VITE_API_URL=http://localhost:5118
   ```
4. Nainstalujte dependence:
   ```bash
   npm install
   ```

---

## 🧪 Testování API

Pro testování API endpointů použijte:

1. **Automatický testovací skript** (nedoporučuje se commitovat):
   ```bash
   .\test-api.ps1
   ```
   Tento skript automaticky získá JWT token a otestuje základní funkcionality.

2. **Ruční testování přes SPI.http**:
   - Otevřete `api/api/SPI.http` ve VS Code
   - Nejdřív spusťte registraci a přihlášení
   - Zkopírujte JWT token z odpovědi přihlášení
   - Nahraďte `YOUR_JWT_TOKEN_HERE` ve zbývajících requestech
   - Klikněte "Send Request" u jednotlivých endpointů

### Přidání testovacích dat

Pro testování funkcí s knihami použijte admin endpointy:
- `POST /data/cdb` - import z JSON
- `POST /data/csv` - import z CSV

---

## 📁 Struktura projektu

```
PSI/
├── api/                          # Backend
│   ├── api/                      # ASP.NET Core aplikace
│   │   ├── Controllers/          # API endpointy
│   │   ├── Services/             # Business logika
│   │   ├── DTO/                  # Data transfer objects
│   │   ├── appsettings.json      # Konfigurace
│   │   └── SPI.http              # API test requests
│   ├── EFModels/                 # Entity Framework modely
│   ├── initdb/                   # SQL inicializační skripty
│   └── compose.yml               # Docker Compose config
│
├── frontend/                      # Frontend
│   ├── src/
│   │   ├── components/           # React komponenty
│   │   ├── pages/                # Page komponenty
│   │   ├── services/             # API komunikace
│   │   ├── types/                # TypeScript typy
│   │   ├── hooks/                # Custom hooks
│   │   └── App.tsx               # Hlavní komponenta
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── diagrams/                      # Diagramy (use-case, class-diagram)
├── prototype/                     # Prototyp (mimo projekt)
└── README.md                      # Tento soubor
```

---

## 📚 Přehled aplikace

Aplikace poskytuje:
- Správu uživatelských účtů (registrace, přihlášení, profil)
- Vyhledávání a filtrování knih
- Správu komentářů a hodnocení knih
- Správu oblíbených knih uživatelů
- Správu objednávek
- Import dat do databáze z CSV a JSON
- Auditování akcí uživatelů

### 👥 Uživatelské role

Aplikace rozlišuje 3 typy uživatelů: (Viz [use-case diagram](./diagrams/use-case.md))

#### Návštěvník (nepřihlášený)
- Může procházet katalog knih
- Může filtrovat podle žánru
- Může zobrazit detail knihy a číst recenze
- Nemůže objednávat ani přidávat hodnocení

#### Registrovaný uživatel
- Má všechny možnosti návštěvníka
- Může vytvářet objednávky
- Může přidávat hodnocení a recenze
- Má sekci „Můj účet" (historie objednávek, úprava údajů)

#### Administrátor
- Má všechny možnosti běžného uživatele
- Vidí záložku „Administrace"
- Může přidávat nové knihy
- Může zobrazit audit log

---

## 🔌 API Endpoints

Detailní dokumentaci API dostaneš v souboru [api/api/SPI.http](./api/api/SPI.http)

### Authenticate endpoints
- `POST /auth/register` - Registrace nového uživatele
- `POST /auth/login` - Přihlášení (vrací JWT token)

### Books endpoints
- `GET /books` - Výpis knih s filtrováním a stránkováním
- `GET /books/{id}` - Detail konkrétní knihy
- `GET /books/genres` - Seznam všech žánrů
- `GET /books/favourites` - Výpis oblíbených knih (vyžaduje JWT)
- `POST /books/favourites/{id}` - Přidání do oblíbených (vyžaduje JWT)
- `DELETE /books/favourites/{bookId}` - Odebrání z oblíbených (vyžaduje JWT)

### User endpoints
- `GET /user/detail` - Detail přihlášeného uživatele (vyžaduje JWT)
- `POST /user/update` - Aktualizace údajů uživatele (vyžaduje JWT)

### Order endpoints
- `POST /order/order` - Vytvoření nové objednávky (vyžaduje JWT)
- `GET /order/orders` - Výpis objednávek uživatele (vyžaduje JWT)

### Comment endpoints
- `POST /comments/comment` - Přidání komentáře a hodnocení (vyžaduje JWT)

### Data import endpoints
- `POST /data/csv` - Import knih z CSV souboru (admin)
- `POST /data/cdb` - Import knih z JSON (admin)

### Audit endpoints
- `GET /audit/audit` - Audit log (admin)

---

## 🛠️ Tech Stack

### Backend
- **Framework:** .NET 8.0 (ASP.NET Core)
- **Database:** MySQL 9
- **ORM:** Entity Framework Core
- **Authentication:** JWT
- **Logging:** Serilog
- **Mapping:** AutoMapper

### Frontend
- **Framework:** React 18
- **Language:** TypeScript
- **Build tool:** Vite
- **Routing:** React Router v6
- **HTTP:** Axios
- **Styling:** CSS (vanilla)

---

## 📝 Další kroky

### Backend
- [ ] Role-based access control (admin features)
- [ ] Swagger/OpenAPI dokumentace
- [ ] Unit testing
- [ ] API error handling improvement

### Frontend
- [ ] Implementace BooksPage s filtrováním
- [ ] Book cards komponenty
- [ ] Shopping cart
- [ ] Checkout proces
- [ ] User profil editace
- [ ] Responsivní design
- [ ] Form validace
- [ ] Error handling UI
- [ ] Loading states
- [ ] Testing (Jest, React Testing Library)
