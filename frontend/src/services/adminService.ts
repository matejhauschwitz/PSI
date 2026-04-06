import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5118'
})

// Add authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface AdminUser {
  id?: number
  userName?: string
  name?: string
  email?: string
  role?: number
}

export interface AdminOrder {
  id?: number
  userId?: number
  totalPrice?: number
  status?: number
  created?: string
  paymentMethod?: number
}

export interface AdminBook {
  id?: number
  title?: string
  authors?: string
  price?: number
  isbn10?: string
  isbn13?: string
  isHidden?: boolean
}

export interface AdminAuditLog {
  id?: number
  userName?: string
  logType?: number
  createdDate?: string
  original?: string
  updated?: string
}

export const adminService = {
  // Users
  getUsers: async (): Promise<AdminUser[]> => {
    const response = await api.get('/admin/users')
    return response.data
  },

  createUser: async (user: AdminUser): Promise<void> => {
    await api.post('/admin/users', user)
  },

  updateUser: async (id: number, user: AdminUser): Promise<void> => {
    await api.put(`/admin/users/${id}`, user)
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`)
  },

  // Orders
  getOrders: async (): Promise<AdminOrder[]> => {
    const response = await api.get('/admin/orders')
    return response.data
  },

  updateOrderStatus: async (id: number, status: number): Promise<void> => {
    await api.put(`/admin/orders/${id}/status`, { status })
  },

  deleteOrder: async (id: number): Promise<void> => {
    await api.delete(`/admin/orders/${id}`)
  },

  // Books
  getBooks: async (): Promise<AdminBook[]> => {
    const response = await api.get('/admin/books')
    return response.data
  },

  createBook: async (book: AdminBook): Promise<void> => {
    await api.post('/admin/books', book)
  },

  updateBook: async (id: number, book: AdminBook): Promise<void> => {
    await api.put(`/admin/books/${id}`, book)
  },

  deleteBook: async (id: number): Promise<void> => {
    await api.delete(`/admin/books/${id}`)
  },

  // AuditLogs
  getAuditLogs: async (
    logType?: string,
    userName?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AdminAuditLog[]> => {
    const params = new URLSearchParams()
    if (logType) params.append('logType', logType)
    if (userName) params.append('userName', userName)
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await api.get(`/admin/auditlogs?${params}`)
    return response.data
  }
}
