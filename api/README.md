# DataLoadController - Načítání dat z JSON řetězce

Tento dokument popisuje funkci endpointu, který umožňuje načítat data knih z JSON řetězce a ukládat je do databáze prostřednictvím Entity Frameworku v ASP.NET Core API.

## Endpoint

**URL:** `/data/cdb`  
**Metoda:** `POST`

### Popis

Tento endpoint slouží k načtení dat knih ve formátu JSON, které jsou zaslány v těle požadavku. Po přijetí je JSON řetězec deserializován do seznamu objektů typu `Book` a následně uložen do databáze.

### Požadavek

- Tělo požadavku (`Body`): JSON řetězec obsahující data knih.

### Odpovědi

- `200 OK`: Data byla úspěšně načtena a uložena do databáze.
  - Textová odpověď: `"Data loaded successfully from string."`
  
- `400 Bad Request`: Pokud je požadavek prázdný nebo obsahuje neplatný řetězec JSON.
  - Textová odpověď: `"No data provided."`
  
- `500 Internal Server Error`: Pokud dojde k chybě při zpracování nebo ukládání dat.
  - Textová odpověď: `"Internal server error."`

## Metoda LoadFromString

Metoda `LoadFromString` je zodpovědná za načtení a uložení dat do databáze z JSON řetězce.

### Jak to funguje

1. **Vstup:**
   - Metoda přijímá řetězec obsahující JSON data reprezentující kolekci objektů typu `Book`.

2. **Deserializace:**
   - Data jsou deserializována do seznamu objektů typu `Book` pomocí `JsonSerializer.Deserialize<List<Book>>(json)`.

3. **Uložení do databáze:**
   - Objekty knih jsou přidány do kontextu databáze (`ctx.Books.AddRange(books)`) a následně uloženy voláním `await ctx.SaveChangesAsync()`.

### Závislosti

- `DatabaseContext`: Kontext databáze pro komunikaci s databází.
- `JsonSerializer`: Použit k deserializaci JSON řetězce do seznamu objektů.
