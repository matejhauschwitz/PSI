import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService, type AdminUser, type AdminOrder, type AdminBook, type AdminAuditLog } from '../services/adminService'

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'books' | 'auditlogs'>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [books, setBooks] = useState<AdminBook[]>([])
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ logType: '', userName: '', startDate: '', endDate: '' })

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    loadData()
  }, [activeTab])

  const checkAdminAccess = async () => {
    try {
      await adminService.getUsers()
    } catch (error) {
      console.error('Admin access check failed:', error)
      navigate('/')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'users':
          const usersData = await adminService.getUsers()
          setUsers(usersData)
          break
        case 'orders':
          const ordersData = await adminService.getOrders()
          setOrders(ordersData)
          break
        case 'books':
          const booksData = await adminService.getBooks()
          setBooks(booksData)
          break
        case 'auditlogs':
          const auditData = await adminService.getAuditLogs(
            filters.logType,
            filters.userName,
            filters.startDate,
            filters.endDate
          )
          setAuditLogs(auditData)
          break
      }
    } catch (error: any) {
      console.error('Error loading data:', error)
      toast.error('Chyba při načítání dat')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (entity: string, id?: number) => {
    if (!id) return
    if (!window.confirm('Opravdu chcete smazat?')) return

    try {
      switch (entity) {
        case 'users':
          await adminService.deleteUser(id)
          break
        case 'orders':
          await adminService.deleteOrder(id)
          break
        case 'books':
          await adminService.deleteBook(id)
          break
      }
      toast.success('Odstraněno')
      loadData()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error('Chyba při odstraňování')
    }
  }

  const handleStatusChange = async (orderId?: number, newStatus?: number) => {
    if (!orderId || newStatus === undefined) return

    try {
      await adminService.updateOrderStatus(orderId, newStatus)
      toast.success('Status aktualizován')
      loadData()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Chyba při aktualizaci statusu')
    }
  }

  const renderUsersTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 text-left">Username</th>
            <th className="px-4 py-2 text-left">Jméno</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-center">Akce</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{user.userName}</td>
              <td className="px-4 py-2">{user.name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.role === 1 ? 'Admin' : 'User'}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleDelete('users', user.id)}
                  className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                >
                  <Trash2 size={16} /> Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderOrdersTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">Uživatel</th>
            <th className="px-4 py-2 text-left">Cena</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Datum</th>
            <th className="px-4 py-2 text-center">Akce</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{order.id}</td>
              <td className="px-4 py-2">{order.userId}</td>
              <td className="px-4 py-2">{order.totalPrice?.toFixed(2)} Kč</td>
              <td className="px-4 py-2">
                <select
                  value={order.status || 0}
                  onChange={(e) => handleStatusChange(order.id, parseInt(e.target.value))}
                  className="border rounded px-2 py-1"
                >
                  <option value={0}>Čekající</option>
                  <option value={1}>Zpracovávání</option>
                  <option value={2}>Dokončeno</option>
                  <option value={3}>Zrušeno</option>
                </select>
              </td>
              <td className="px-4 py-2">{order.created ? new Date(order.created).toLocaleDateString('cs-CZ') : '-'}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleDelete('orders', order.id)}
                  className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                >
                  <Trash2 size={16} /> Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderBooksTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-4 py-2 text-left">Název</th>
            <th className="px-4 py-2 text-left">Autor</th>
            <th className="px-4 py-2 text-left">Cena</th>
            <th className="px-4 py-2 text-left">ISBN</th>
            <th className="px-4 py-2 text-center">Akce</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{book.title}</td>
              <td className="px-4 py-2">{book.authors}</td>
              <td className="px-4 py-2">{book.price?.toFixed(2)} Kč</td>
              <td className="px-4 py-2">{book.isbn13 || book.isbn10}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => handleDelete('books', book.id)}
                  className="text-red-600 hover:text-red-800 inline-flex items-center gap-1"
                >
                  <Trash2 size={16} /> Smazat
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderAuditLogsTable = () => (
    <div>
      <div className="mb-4 grid grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Filtrovat userName..."
          value={filters.userName}
          onChange={(e) => setFilters({ ...filters, userName: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          placeholder="Od..."
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="date"
          placeholder="Do..."
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={() => loadData()}
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Filtrovat
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Uživatel</th>
              <th className="px-4 py-2 text-left">Typ</th>
              <th className="px-4 py-2 text-left">Datum</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map(log => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{log.id}</td>
                <td className="px-4 py-2">{log.userName}</td>
                <td className="px-4 py-2">{log.logType}</td>
                <td className="px-4 py-2">{log.createdDate ? new Date(log.createdDate).toLocaleDateString('cs-CZ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Administrace</h1>

        <div className="flex gap-4 mb-8">
          {(['users', 'orders', 'books', 'auditlogs'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded font-semibold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab === 'users' ? 'Uživatelé'
                : tab === 'orders' ? 'Objednávky'
                : tab === 'books' ? 'Knihy'
                : 'Audit Log'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <div className="text-center py-8">Načítám...</div>
          ) : (
            <>
              {activeTab === 'users' && renderUsersTable()}
              {activeTab === 'orders' && renderOrdersTable()}
              {activeTab === 'books' && renderBooksTable()}
              {activeTab === 'auditlogs' && renderAuditLogsTable()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
