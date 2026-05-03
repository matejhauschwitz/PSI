import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminService } from './adminService'
import api from './api'

// Namockujeme náš api objekt (typicky Axios), abychom nevolali skutečný backend
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}))

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --- USERS ---
  it('getUsers fetches users data', async () => {
    const mockUsers = [{ id: 1, userName: 'admin' }]
    // Nastavíme, co má mockovaný api.get vrátit (simulace odpovědi ze serveru)
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockUsers })

    const result = await adminService.getUsers()

    // Ověříme, že jsme zavolali správný endpoint
    expect(api.get).toHaveBeenCalledWith('/admin/users')
    // Ověříme, že funkce vrací správná data rozbalená z 'response.data'
    expect(result).toEqual(mockUsers)
  })

  it('createUser posts a new user', async () => {
    const newUser = { userName: 'test' }
    await adminService.createUser(newUser)
    expect(api.post).toHaveBeenCalledWith('/admin/users', newUser)
  })

  it('updateUser puts updated user data', async () => {
    const updatedUser = { userName: 'test2' }
    await adminService.updateUser(1, updatedUser)
    expect(api.put).toHaveBeenCalledWith('/admin/users/1', updatedUser)
  })

  it('deleteUser deletes a user', async () => {
    await adminService.deleteUser(1)
    expect(api.delete).toHaveBeenCalledWith('/admin/users/1')
  })

  // --- ORDERS ---
  it('getOrders fetches orders data', async () => {
    const mockOrders = [{ id: 101, status: 0 }]
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockOrders })

    const result = await adminService.getOrders()

    expect(api.get).toHaveBeenCalledWith('/admin/orders')
    expect(result).toEqual(mockOrders)
  })

  it('updateOrderStatus updates the status of an order', async () => {
    await adminService.updateOrderStatus(101, 2)
    // Zde navíc kontrolujeme, zda správně balíme číslo do objektu { status }
    expect(api.put).toHaveBeenCalledWith('/admin/orders/101/status', { status: 2 })
  })

  it('deleteOrder deletes an order', async () => {
    await adminService.deleteOrder(101)
    expect(api.delete).toHaveBeenCalledWith('/admin/orders/101')
  })

  // --- BOOKS ---
  it('getBooks fetches books data', async () => {
    const mockBooks = [{ id: 201, title: 'Kniha' }]
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockBooks })

    const result = await adminService.getBooks()

    expect(api.get).toHaveBeenCalledWith('/admin/books')
    expect(result).toEqual(mockBooks)
  })

  it('createBook posts a new book', async () => {
    const newBook = { title: 'Nová kniha' }
    await adminService.createBook(newBook)
    expect(api.post).toHaveBeenCalledWith('/admin/books', newBook)
  })

  it('updateBook puts updated book data', async () => {
    const updatedBook = { title: 'Upravená kniha' }
    await adminService.updateBook(201, updatedBook)
    expect(api.put).toHaveBeenCalledWith('/admin/books/201', updatedBook)
  })

  it('deleteBook deletes a book', async () => {
    await adminService.deleteBook(201)
    expect(api.delete).toHaveBeenCalledWith('/admin/books/201')
  })

  // --- AUDIT LOGS ---
  // Zde testujeme obě cesty (větve/branches) kvůli URLSearchParams

  it('getAuditLogs fetches audit logs without params', async () => {
    const mockLogs = [{ id: 301, logType: 1 }]
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockLogs })

    const result = await adminService.getAuditLogs()

    // Pokud nepředáme žádné parametry, URL končí otazníkem (záleží na implementaci URLSearchParams, ale takto to většinou propíše browser/node)
    expect(api.get).toHaveBeenCalledWith('/admin/auditlogs?')
    expect(result).toEqual(mockLogs)
  })

  it('getAuditLogs fetches audit logs with all params', async () => {
    const mockLogs = [{ id: 301, logType: 1 }]
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockLogs })

    const result = await adminService.getAuditLogs('LOGIN', 'admin', '2026-01-01', '2026-12-31')

    // Tímto zajistíme, že všech 5 "if" podmínek v getAuditLogs proběhne a my dostaneme 100% Branch Coverage
    expect(api.get).toHaveBeenCalledWith('/admin/auditlogs?logType=LOGIN&userName=admin&startDate=2026-01-01&endDate=2026-12-31')
    expect(result).toEqual(mockLogs)
  })
})