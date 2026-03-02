# 📚 Bookstore

> **Semestrální projekt – PSI**

## 👥 Kontributoři

- **Jiří Šeps**
- **Vojtěch Gerö**
- **Matěj Hauschwitz**
## Přehled
• Správu uživatelských účtů (registrace, přihlášení, profil)

• Vyhledávání a filtrování knih

• Správu komentářů a hodnocení knih

• Správu oblíbených knih uživatelů

• Správu objednávek

• Import dat do databáze z CSV a JSON

• Auditování akcí uživatelů

#  Uživatelské role

Aplikace rozlišuje 3 typy uživatelů.
- [use-case diagram](./diagrams/use-case.md)

## Návštěvník (nepřihlášený)
- Může procházet katalog knih
- Může filtrovat podle žánru
- Může zobrazit detail knihy a číst recenze
- Nemůže objednávat ani přidávat hodnocení (bude vyzván k přihlášení)

##  Registrovaný uživatel
- Má všechny možnosti návštěvníka
- Může vytvářet objednávky
- Může přidávat hodnocení a recenze
- Má sekci „Můj účet“ (historie objednávek, úprava údajů)

##  Administrátor
- Má všechny možnosti běžného uživatele
- Vidí záložku „Administrace“
- Může přidávat nové knihy
- Může zobrazit audit log
# API Endpoints

## UserController (/user)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| POST | /update | Aktualizace údajů přihlášeného uživatele |
| GET | /detail | Detail přihlášeného uživatele |

---

## AuthController (/auth)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| POST | /register | Registrace nového uživatele |
| POST | /login | Přihlášení uživatele (vrací JWT token) |

---

## BooksController (/books)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| GET | / | Výpis knih s filtrováním (název, autor, žánr, cena, hodnocení) + stránkování |
| GET | /{id} | Detail konkrétní knihy |
| GET | /genres | Seznam unikátních žánrů |
| POST | /favourites/{id} | Přidání knihy do oblíbených |
| GET | /favourites | Výpis oblíbených knih přihlášeného uživatele |
| DELETE | /favourites/{bookId} | Odstranění knihy z oblíbených |

---

## CommentController (/comments)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| POST | /comment | Přidání komentáře a hodnocení ke knize |

---

## OrderController (/order)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| POST | /order | Vytvoření nové objednávky |
| GET | /orders | Výpis objednávek přihlášeného uživatele |

---

## DataLoadController (/data)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| POST | /csv | Import knih z CSV souboru |
| POST | /cdb | Import knih z JSON / string zdroje |

---

## AuditController (/audit)

| Metoda | Endpoint | Popis |
|--------|----------|--------|
| GET | /audit | Získání auditních záznamů |

---

## Třídy
- [class diagram](./diagrams/class-diagram.md)

## Tech Stack
### Frontend
- React
- TypeScript
- JavaScript
- CSS

### Backend
- .NET (ASP.NET Core Web API)

