import axios from 'axios'
import type { User, Book, Comment, Order, LoginResponse, BooksResponse } from '../types'

const isDevelopment = window.location.hostname === 'localhost';

const api = axios.create({
  baseURL: isDevelopment 
    ? 'http://localhost:5118' 
    : '/'
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth Service
export const authService = {
  register: async (user: User & { password: string; favouriteGerners: string[] }) => {
    return api.post('/auth/register', user)
  },

  login: async (userName: string, password: string): Promise<string> => {
    const response = await api.post<string>('/auth/login', { userName, password })
    const token = response.data
    localStorage.setItem('jwt_token', token)
    return token
  },

  logout: () => {
    localStorage.removeItem('jwt_token')
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('jwt_token')
  },
}

// Books Service
export const bookService = {
  getBooks: async (page = 1, pageSize = 10, title = '', genre = '', minPrice?: number, maxPrice?: number) => {
    const params: any = { page, pageSize };
    if (title) params.title = title;
    if (genre) params.genre = genre;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    const response = await api.get<BooksResponse>('/books', { params });
    return response.data
  },

  getGenres: async () => {
    const response = await api.get<string[]>('/books/genres');
    return response.data;
  },

  getBook: async (id: number) => {
    const response = await api.get<Book>(`/books/${id}`)
    return response.data
  },

  getFavourites: async (page = 1, pageSize = 10) => {
    const response = await api.get<BooksResponse>('/books/favourites', {
      params: { page, pageSize },
    })
    return response.data
  },

  addFavourite: async (bookId: number) => {
    return api.post(`/books/favourites/${bookId}`)
  },

  removeFavourite: async (bookId: number) => {
    return api.delete(`/books/favourites/${bookId}`)
  },
}

// User Service
export const userService = {
  getUserDetail: async () => {
    const response = await api.get<User>('/user/detail')
    return response.data
  },

  updateUser: async (user: Partial<User>) => {
    // Pošli data jak jsou - bez transformace
    // User je již v backend formátu (StreetAddress, City, Zip, Country)
    return api.post('/user/update', user)
  },
}

// Comment Service
export const commentService = {
  addComment: async (comment: Comment) => {
    const token = localStorage.getItem('jwt_token')
    if (!token) {
      throw new Error('Nejste přihlášeni')
    }

    const payload = {
      bookId: comment.bookId,
      content: comment.comment,
      rating: comment.rating
    }

    console.log('Sending comment payload:', payload)

    try {
      return await api.post('/comments/comment', payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    } catch (error: any) {
      // Extrahuj error message z backendu
      const errorMessage = error.response?.data?.message || 
                          error.response?.data ||
                          error.message ||
                          'Nepodařilo se přidat komentář'
      throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage))
    }
  },

  getComments: async (bookId: number) => {
    try {
      const response = await api.get<Comment[]>(`/comments/${bookId}`)
      return response.data
    } catch (err) {
      console.warn('Comments endpoint not available')
      return []
    }
  },
}

// Order Service
export const orderService = {
  createOrder: async (order: Order) => {
    // Backend má JsonNamingPolicy.CamelCase, takže odesílá camelCase
    const payload = {
      bookIds: order.bookIds,
      paymentMethod: order.paymentMethod, // camelCase
    }
    return api.post('/order/order', payload)
  },

  getOrders: async () => {
    const response = await api.get<any[]>('/order/orders')
    // Transformuj backend data na frontend Order interface
    return response.data.map((dto: any) => ({
      id: dto.id,
      userId: dto.userId,
      books: dto.books || [],
      bookIds: dto.books?.map((b: any) => b.id) || [],
      status: dto.status || 'Unknown',
      paymentMethod: dto.paymentMethod,
      totalPrice: dto.totalPrice,
      createdAt: dto.created ? new Date(dto.created).toISOString() : new Date().toISOString(),
    }))
  },
}

export default api
