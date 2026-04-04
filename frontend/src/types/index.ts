export interface User {
  id?: number
  name: string
  userName: string
  email?: string
  address?: Address
  billingAddress?: Address
  isMale?: boolean
  birthDay?: string
  favouriteGerners?: string[]
}

export interface Address {
  street?: string
  city?: string
  zipCode?: string
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
  bookIds: number[]
  status?: string
  paymentMethod: string
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
