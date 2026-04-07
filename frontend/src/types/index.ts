export interface User {
  id?: number
  name: string
  userName: string
  email?: string
  address?: Address
  billingAddress?: Address
  isMale?: boolean
  birthDay?: string
  processData?: boolean
  favouriteGerners?: string[]
  role?: number // 0 = User, 1 = Admin
}

export interface Address {
  streetAddress?: string
  city?: string
  zip?: string
  country?: string
}

export interface Book {
  id: number
  title: string
  author: string
  genre?: string
  publicationYear?: number
  rating?: number
  coverImageUrl?: string
  pageCount?: number
  totalRatings?: number
  description?: string
  price?: number
}

export interface Comment {
  id?: number
  bookId: number
  comment: string
  rating: number
  creatorUserName?: string
  createdAt?: string
}

export interface Order {
  id?: number
  userId?: number
  books?: Book[]
  bookIds?: number[]
  status?: string
  paymentMethod?: string | number
  totalPrice?: number
  createdAt?: string
}

export interface LoginResponse {
  token: string
}

export interface BooksResponse {
  totalRecords: number
  totalPages: number
  page: number
  pageSize: number
  books: Book[]
}
