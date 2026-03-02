flowchart TD
    Guest["Nepřihlášený uživatel"]
    User["Přihlášený uživatel"]
    Admin["Administrátor"]

    User -.->|"s1"| User

    subgraph "Veřejná sekce"
        UC1["Prohlížení knih"]
        UC2["Vyhledávání a filtrování"]
        UC3["Přepínání jazyků (Překlady)"]
    end

    subgraph "Uživatelská sekce"
        UC4["Správa profilu"]
        UC5["Vytvoření objednávky (Nákup)"]
        UC6["Přidání recenze a hodnocení"]
    end

    subgraph "Administrace"
        UC7["Manuální přidání/editace knihy"]
        UC8["Import dat (CSV/JSON)"]
        UC9["Sledování auditních logů"]
        UC10["Zobrazení změn (Před vs Po)"]
    end

    Guest --> UC1
    Guest --> UC2
    Guest --> UC3

    User --> UC4
    User --> UC5
    User --> UC6

    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    UC9 -.->|"include"| UC10