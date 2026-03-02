```mermaid
flowchart TD
    %% Definice Aktérů se stylováním
    Guest["Nepřihlášený uživatel"]
    User["Přihlášený uživatel"]
    Admin["Administrátor"]

    %% Definice hierarchie (přístupová práva)
    Admin --> User
    User --> Guest

    subgraph PublicSection ["Veřejná sekce"]
        UC1["Prohlížení knih"]
        UC2["Vyhledávání a filtrování"]
        UC3["Přepínání jazyků (Překlady)"]
    end

    subgraph UserSection ["Uživatelská sekce"]
        UC4["Správa profilu"]
        UC5["Vytvoření objednávky (Nákup)"]
        UC6["Přidání recenze a hodnocení"]
    end

    subgraph AdminSection ["Administrace"]
        UC7["Manuální přidání/editace knihy"]
        UC8["Import dat (CSV/JSON)"]
        UC9["Sledování auditních logů"]
        UC10["Zobrazení změn (Před vs Po)"]
    end

    %% Propojení s funkcemi
    Guest --- UC1
    Guest --- UC2
    Guest --- UC3

    User --- UC4
    User --- UC5
    User --- UC6

    Admin --- UC7
    Admin --- UC8
    Admin --- UC9
    
    %% Relace mezi logy
    UC9 -.->|"obsahuje"| UC10

    %% Stylizace pro lepší přehlednost
    style Admin fill:#f96,stroke:#333,stroke-width:2px
    style User fill:#69f,stroke:#333,stroke-width:2px
    style Guest fill:#9f9,stroke:#333,stroke-width:2px