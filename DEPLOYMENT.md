# 🏗️ Architektura Nasazení (CI/CD Pipeline)

Tento projekt využívá **GitHub Actions** pro automatizaci a **Azure Bicep** pro definici infrastruktury jako kódu (IaC).  
Celý proces je rozdělen do tří logických celků, které na sebe navazují.

---

## 🔄 Mermaid Diagram: Workflow Flow

Tento diagram ukazuje, co se stane po pushnutí kódu do větve `main`.

```mermaid
graph TD
    A[Push do main] --> B{Změna v cestě?}

    B -- "infrastructure/**" --> C[Deploy Infrastructure]
    B -- "api/**" --> D[Deploy Backend]
    B -- "frontend/**" --> E[Deploy Frontend]

    subgraph "Infrastructure (Bicep)"
        C --> C1[Azure Login OIDC]
        C1 --> C2[Bicep Validate]
        C2 --> C3[Bicep Deploy]
        C3 --> C4[Zdroje: ACR, SQL, WebApp, Storage]
    end

    subgraph "Backend (Docker + .NET)"
        D --> D1[.NET Restore & Test]
        D1 --> D2[Build Docker Image]
        D2 --> D3[Push do Azure Container Registry]
        D3 --> D4[Restart App Service]
    end

    subgraph "Frontend (Vite + Static Web)"
        E --> E1[NPM Install & Test]
        E --> E2[NPM Build]
        E2 --> E3[Azure Login OIDC]
        E3 --> E4[Upload do Azure Storage $web]
    end
```

---

## 📘 Dokumentace Pipeline

### 1️⃣ Prerekvizity (Azure Setup)

Před prvním spuštěním nastav v GitHubu:

#### 🔐 Secrets

- `AZURE_CLIENT_ID` – Service Principal ID  
- `AZURE_TENANT_ID` – Tenant ID  
- `AZURE_SUBSCRIPTION_ID` – Subscription ID  
- `DB_PASSWORD` – Heslo pro SQL server  
- `JWT_SECRET` – Klíč pro podepisování tokenů  

#### ⚙️ Variables

- `ACR_NAME` – Název Container Registry  
- `VITE_API_URL` – URL backendu  

---

### 2️⃣ Infrastructure as Code (Bicep)

📁 `infrastructure/shared.bicep`

- Deklarativní definice infrastruktury
- Modulární struktura (networking, DB, monitoring)

⚠️ Poznámka:

Používá se:

```bicep
#disable-next-line BCEL-073
```

Důvod: Bicep linter někdy nezná `staticWebsite`, i když Azure API ho podporuje.

---

### 3️⃣ Backend CI/CD

- Každý push do `api/**`:
  - spustí unit testy
  - pokud projdou → build Docker image (`linux/amd64`)
- Image se uloží do ACR:
  - `latest`
  - unikátní SHA tag

🚀 Nasazení:
- běží v **App Service (B1 tier)**

---

### 4️⃣ Frontend CI/CD

- Node.js 20 + Vite build
- výstup: `dist/`

📦 Nasazení:
- upload do Azure Storage (`$web`)

🔐 Bezpečnost:
- používá OIDC:
```bash
--auth-mode login
```

➡️ žádné storage keys → menší pain + bezpečnější
