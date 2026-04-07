import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService';
export default function AdminPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [books, setBooks] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ logType: '', userName: '', startDate: '', endDate: '' });
    useEffect(() => {
        checkAdminAccess();
    }, []);
    useEffect(() => {
        loadData();
    }, [activeTab]);
    const checkAdminAccess = async () => {
        try {
            await adminService.getUsers();
        }
        catch (error) {
            console.error('Admin access check failed:', error);
            navigate('/');
        }
    };
    const loadData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'users':
                    const usersData = await adminService.getUsers();
                    setUsers(usersData);
                    break;
                case 'orders':
                    const ordersData = await adminService.getOrders();
                    setOrders(ordersData);
                    break;
                case 'books':
                    const booksData = await adminService.getBooks();
                    setBooks(booksData);
                    break;
                case 'auditlogs':
                    const auditData = await adminService.getAuditLogs(filters.logType, filters.userName, filters.startDate, filters.endDate);
                    setAuditLogs(auditData);
                    break;
            }
        }
        catch (error) {
            console.error('Error loading data:', error);
            toast.error('Chyba při načítání dat');
        }
        finally {
            setLoading(false);
        }
    };
    const handleDelete = async (entity, id) => {
        if (!id)
            return;
        if (!window.confirm('Opravdu chcete smazat?'))
            return;
        try {
            switch (entity) {
                case 'users':
                    await adminService.deleteUser(id);
                    break;
                case 'orders':
                    await adminService.deleteOrder(id);
                    break;
                case 'books':
                    await adminService.deleteBook(id);
                    break;
            }
            toast.success('Odstraněno');
            loadData();
        }
        catch (error) {
            console.error('Error deleting:', error);
            toast.error('Chyba při odstraňování');
        }
    };
    const handleStatusChange = async (orderId, newStatus) => {
        if (!orderId || newStatus === undefined)
            return;
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            toast.success('Status aktualizován');
            loadData();
        }
        catch (error) {
            console.error('Error updating status:', error);
            toast.error('Chyba při aktualizaci statusu');
        }
    };
    const renderUsersTable = () => (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-blue-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "Username" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Jm\u00E9no" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Email" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Role" }), _jsx("th", { className: "px-4 py-2 text-center", children: "Akce" })] }) }), _jsx("tbody", { children: users.map(user => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: user.userName }), _jsx("td", { className: "px-4 py-2", children: user.name }), _jsx("td", { className: "px-4 py-2", children: user.email }), _jsx("td", { className: "px-4 py-2", children: user.role === 1 ? 'Admin' : 'User' }), _jsx("td", { className: "px-4 py-2 text-center", children: _jsxs("button", { onClick: () => handleDelete('users', user.id), className: "text-red-600 hover:text-red-800 inline-flex items-center gap-1", children: [_jsx(Trash2, { size: 16 }), " Smazat"] }) })] }, user.id))) })] }) }));
    const renderOrdersTable = () => (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-blue-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "ID" }), _jsx("th", { className: "px-4 py-2 text-left", children: "U\u017Eivatel" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Cena" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Status" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Datum" }), _jsx("th", { className: "px-4 py-2 text-center", children: "Akce" })] }) }), _jsx("tbody", { children: orders.map(order => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: order.id }), _jsx("td", { className: "px-4 py-2", children: order.userName }), _jsxs("td", { className: "px-4 py-2", children: [order.totalPrice?.toFixed(2), " K\u010D"] }), _jsx("td", { className: "px-4 py-2", children: _jsxs("select", { value: order.status || 0, onChange: (e) => handleStatusChange(order.id, parseInt(e.target.value)), className: "border rounded px-2 py-1", children: [_jsx("option", { value: 0, children: "\u010Cekaj\u00EDc\u00ED" }), _jsx("option", { value: 1, children: "Zpracov\u00E1v\u00E1n\u00ED" }), _jsx("option", { value: 2, children: "Dokon\u010Deno" }), _jsx("option", { value: 3, children: "Zru\u0161eno" })] }) }), _jsx("td", { className: "px-4 py-2", children: order.created ? new Date(order.created).toLocaleDateString('cs-CZ') : '-' }), _jsx("td", { className: "px-4 py-2 text-center", children: _jsxs("button", { onClick: () => handleDelete('orders', order.id), className: "text-red-600 hover:text-red-800 inline-flex items-center gap-1", children: [_jsx(Trash2, { size: 16 }), " Smazat"] }) })] }, order.id))) })] }) }));
    const renderBooksTable = () => (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-blue-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "N\u00E1zev" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Autor" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Cena" }), _jsx("th", { className: "px-4 py-2 text-left", children: "ISBN" }), _jsx("th", { className: "px-4 py-2 text-center", children: "Akce" })] }) }), _jsx("tbody", { children: books.map(book => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: book.title }), _jsx("td", { className: "px-4 py-2", children: book.authors }), _jsxs("td", { className: "px-4 py-2", children: [book.price?.toFixed(2), " K\u010D"] }), _jsx("td", { className: "px-4 py-2", children: book.isbn13 || book.isbn10 }), _jsx("td", { className: "px-4 py-2 text-center", children: _jsxs("button", { onClick: () => handleDelete('books', book.id), className: "text-red-600 hover:text-red-800 inline-flex items-center gap-1", children: [_jsx(Trash2, { size: 16 }), " Smazat"] }) })] }, book.id))) })] }) }));
    const renderAuditLogsTable = () => (_jsxs("div", { children: [_jsxs("div", { className: "mb-4 grid grid-cols-4 gap-4", children: [_jsx("input", { type: "text", placeholder: "Filtrovat userName...", value: filters.userName, onChange: (e) => setFilters({ ...filters, userName: e.target.value }), className: "border rounded px-3 py-2" }), _jsx("input", { type: "date", placeholder: "Od...", value: filters.startDate, onChange: (e) => setFilters({ ...filters, startDate: e.target.value }), className: "border rounded px-3 py-2" }), _jsx("input", { type: "date", placeholder: "Do...", value: filters.endDate, onChange: (e) => setFilters({ ...filters, endDate: e.target.value }), className: "border rounded px-3 py-2" }), _jsx("button", { onClick: () => loadData(), className: "bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700", children: "Filtrovat" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-blue-100", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 text-left", children: "ID" }), _jsx("th", { className: "px-4 py-2 text-left", children: "U\u017Eivatel" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Typ" }), _jsx("th", { className: "px-4 py-2 text-left", children: "Datum" })] }) }), _jsx("tbody", { children: auditLogs.map(log => (_jsxs("tr", { className: "border-b hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-2", children: log.id }), _jsx("td", { className: "px-4 py-2", children: log.userName }), _jsx("td", { className: "px-4 py-2", children: log.logType }), _jsx("td", { className: "px-4 py-2", children: log.createdDate ? new Date(log.createdDate).toLocaleDateString('cs-CZ') : '-' })] }, log.id))) })] }) })] }));
    return (_jsx("div", { className: "min-h-screen bg-gray-100", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 py-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-8", children: "Administrace" }), _jsx("div", { className: "flex gap-4 mb-8", children: ['users', 'orders', 'books', 'auditlogs'].map(tab => (_jsx("button", { onClick: () => setActiveTab(tab), className: `px-4 py-2 rounded font-semibold transition ${activeTab === tab
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`, children: tab === 'users' ? 'Uživatelé'
                            : tab === 'orders' ? 'Objednávky'
                                : tab === 'books' ? 'Knihy'
                                    : 'Audit Log' }, tab))) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: loading ? (_jsx("div", { className: "text-center py-8", children: "Na\u010D\u00EDt\u00E1m..." })) : (_jsxs(_Fragment, { children: [activeTab === 'users' && renderUsersTable(), activeTab === 'orders' && renderOrdersTable(), activeTab === 'books' && renderBooksTable(), activeTab === 'auditlogs' && renderAuditLogsTable()] })) })] }) }));
}
