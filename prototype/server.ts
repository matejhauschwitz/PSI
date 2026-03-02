import express from "express";
import { createServer as createViteServer } from "vite";
import { BookDto, BooksResponse, CommentDto, OrderDto, AuditLogDto } from "./src/interfaces";

const app = express();
app.use(express.json());

// Mock data
let books: BookDto[] = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", price: 10.99, imageUrl: "https://picsum.photos/seed/gatsby/200/300", genre: "Classic", rating: 4.5, description: "A story of the fabulously wealthy Jay Gatsby...", publishedYear: 1925, isbn: "978-0743273565", stock: 10 },
  { id: "2", title: "1984", author: "George Orwell", price: 8.99, imageUrl: "https://picsum.photos/seed/1984/200/300", genre: "Dystopian", rating: 4.8, description: "Among the seminal texts of the 20th century...", publishedYear: 1949, isbn: "978-0451524935", stock: 15 },
  { id: "3", title: "To Kill a Mockingbird", author: "Harper Lee", price: 12.50, imageUrl: "https://picsum.photos/seed/mockingbird/200/300", genre: "Classic", rating: 4.9, description: "The unforgettable novel of a childhood in a sleepy Southern town...", publishedYear: 1960, isbn: "978-0060935467", stock: 5 },
  { id: "4", title: "Dune", author: "Frank Herbert", price: 14.99, imageUrl: "https://picsum.photos/seed/dune/200/300", genre: "Sci-Fi", rating: 4.7, description: "Set on the desert planet Arrakis...", publishedYear: 1965, isbn: "978-0441172719", stock: 20 },
  { id: "5", title: "Pride and Prejudice", author: "Jane Austen", price: 9.50, imageUrl: "https://picsum.photos/seed/pride/200/300", genre: "Romance", rating: 4.6, description: "A classic of English literature...", publishedYear: 1813, isbn: "978-0141439518", stock: 8 },
  { id: "6", title: "The Hobbit", author: "J.R.R. Tolkien", price: 11.99, imageUrl: "https://picsum.photos/seed/hobbit/200/300", genre: "Fantasy", rating: 4.8, description: "In a hole in the ground there lived a hobbit...", publishedYear: 1937, isbn: "978-0547928227", stock: 12 },
];

const comments: CommentDto[] = [
  { id: "1", bookId: "1", userId: "u1", userName: "Alice", text: "Great book!", rating: 5, createdAt: new Date().toISOString() }
];

const orders: OrderDto[] = [];
const auditLogs: AuditLogDto[] = [];

function addAuditLog(userId: string, action: string, entity: string, before: any, after: any) {
  auditLogs.push({
    id: Date.now().toString(),
    userId,
    action,
    entity,
    beforeState: before ? JSON.stringify(before) : undefined,
    afterState: after ? JSON.stringify(after) : undefined,
    timestamp: new Date().toISOString()
  });
}

let mockUser = {
  id: "u1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "User",
  role: "Admin" as 'Admin' | 'User',
  address: {
    street: "123 Main St",
    city: "Anytown",
    zipCode: "12345",
    country: "USA"
  }
};

// Auth Mock
app.post("/api/auth/register", (req, res) => {
  res.json({ token: "mock-jwt-token-for-" + req.body.email, role: "User" });
});

app.post("/api/auth/login", (req, res) => {
  const role = req.body.email === 'admin@example.com' ? 'Admin' : 'User';
  res.json({ token: "mock-jwt-token-for-" + req.body.email, role });
});

// User Mock
app.get("/api/users/profile", (req, res) => {
  res.json(mockUser);
});

app.put("/api/users/profile", (req, res) => {
  const before = { ...mockUser };
  mockUser = { ...mockUser, ...req.body };
  addAuditLog(mockUser.id, "UPDATE", "UserProfile", before, mockUser);
  res.json(mockUser);
});

// Books Mock
app.get("/api/books", (req, res) => {
  const { genre, minPrice, maxPrice, search, page = 1, pageSize = 10 } = req.query;
  let filtered = [...books];
  
  if (genre) filtered = filtered.filter(b => b.genre.toLowerCase() === (genre as string).toLowerCase());
  if (minPrice) filtered = filtered.filter(b => b.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter(b => b.price <= Number(maxPrice));
  if (search) filtered = filtered.filter(b => b.title.toLowerCase().includes((search as string).toLowerCase()) || b.author.toLowerCase().includes((search as string).toLowerCase()));
  
  const p = Number(page);
  const ps = Number(pageSize);
  const paginated = filtered.slice((p - 1) * ps, p * ps);
  
  const response: BooksResponse = {
    items: paginated,
    totalCount: filtered.length,
    page: p,
    pageSize: ps
  };
  res.json(response);
});

app.get("/api/books/:id", (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (book) res.json(book);
  else res.status(404).json({ message: "Book not found" });
});

app.post("/api/books", (req, res) => {
  const newBook: BookDto = { ...req.body, id: Date.now().toString(), rating: 0 };
  books.push(newBook);
  addAuditLog("u1", "CREATE", "Book", null, newBook);
  res.json(newBook);
});

// Audit Mock
app.get("/api/audit/logs", (req, res) => {
  res.json(auditLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
});

// Comments Mock
app.get("/api/comments/:bookId", (req, res) => {
  res.json(comments.filter(c => c.bookId === req.params.bookId));
});

app.post("/api/comments", (req, res) => {
  const newComment = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
  comments.push(newComment);
  res.json(newComment);
});

// Order Mock
app.post("/api/orders", (req, res) => {
  const newOrder: OrderDto = {
    id: Date.now().toString(),
    userId: "u1", // mock user
    orderDate: new Date().toISOString(),
    status: "Pending",
    totalPrice: req.body.totalPrice,
    items: books.filter(b => req.body.bookIds.includes(b.id))
  };
  orders.push(newOrder);
  addAuditLog("u1", "CREATE", "Order", null, newOrder);
  res.json(newOrder);
});

app.get("/api/orders/user", (req, res) => {
  res.json(orders);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const PORT = 5050;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
