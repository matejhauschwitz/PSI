import i18n from 'i18next';
import { initReactI18next } from '@/node_modules/react-i18next';

const resources = {
  en: {
    translation: {
      "books": "Books",
      "cart": "Cart",
      "account": "Account",
      "admin": "Admin",
      "logout": "Logout",
      "login": "Sign In",
      "add_to_cart": "Add to Cart",
      "login_to_buy": "Sign in to purchase",
      "login_to_review": "Sign in to add a review",
      "reviews": "Reviews & Comments",
      "add_review": "Add Review",
      "search_placeholder": "Search books...",
      "all_genres": "All Genres",
      "price_min": "Min Price",
      "price_max": "Max Price",
      "published": "Published",
      "stock": "Stock",
      "available": "available",
      "out_of_stock": "Out of stock",
      "add_book": "Add Book",
      "audit_logs": "Audit Logs",
      "title": "Title",
      "author": "Author",
      "price": "Price",
      "genre": "Genre",
      "description": "Description",
      "image_url": "Image URL",
      "published_year": "Published Year",
      "isbn": "ISBN",
      "save": "Save",
      "cancel": "Cancel",
      "action": "Action",
      "entity": "Entity",
      "timestamp": "Timestamp",
      "details": "Details",
      "user": "User"
    }
  },
  cs: {
    translation: {
      "books": "Knihy",
      "cart": "Košík",
      "account": "Účet",
      "admin": "Administrace",
      "logout": "Odhlásit",
      "login": "Přihlásit",
      "add_to_cart": "Přidat do košíku",
      "login_to_buy": "Pro nákup se musíte přihlásit",
      "login_to_review": "Přihlaste se pro přidání hodnocení.",
      "reviews": "Recenze a komentáře",
      "add_review": "Přidat hodnocení",
      "search_placeholder": "Hledat knihy...",
      "all_genres": "Všechny žánry",
      "price_min": "Min cena",
      "price_max": "Max cena",
      "published": "Vydáno",
      "stock": "Skladem",
      "available": "kusů",
      "out_of_stock": "Vyprodáno",
      "add_book": "Přidat knihu",
      "audit_logs": "Audit Logy",
      "title": "Název",
      "author": "Autor",
      "price": "Cena",
      "genre": "Žánr",
      "description": "Popis",
      "image_url": "URL obrázku",
      "published_year": "Rok vydání",
      "isbn": "ISBN",
      "save": "Uložit",
      "cancel": "Zrušit",
      "action": "Akce",
      "entity": "Entita",
      "timestamp": "Čas",
      "details": "Detaily",
      "user": "Uživatel"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "cs", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
