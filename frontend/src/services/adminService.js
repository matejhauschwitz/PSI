import api from './api';
export const adminService = {
    // Users
    getUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    createUser: async (user) => {
        await api.post('/admin/users', user);
    },
    updateUser: async (id, user) => {
        await api.put(`/admin/users/${id}`, user);
    },
    deleteUser: async (id) => {
        await api.delete(`/admin/users/${id}`);
    },
    // Orders
    getOrders: async () => {
        const response = await api.get('/admin/orders');
        return response.data;
    },
    updateOrderStatus: async (id, status) => {
        await api.put(`/admin/orders/${id}/status`, { status });
    },
    deleteOrder: async (id) => {
        await api.delete(`/admin/orders/${id}`);
    },
    // Books
    getBooks: async () => {
        const response = await api.get('/admin/books');
        return response.data;
    },
    createBook: async (book) => {
        await api.post('/admin/books', book);
    },
    updateBook: async (id, book) => {
        await api.put(`/admin/books/${id}`, book);
    },
    deleteBook: async (id) => {
        await api.delete(`/admin/books/${id}`);
    },
    // AuditLogs
    getAuditLogs: async (logType, userName, startDate, endDate) => {
        const params = new URLSearchParams();
        if (logType)
            params.append('logType', logType);
        if (userName)
            params.append('userName', userName);
        if (startDate)
            params.append('startDate', startDate);
        if (endDate)
            params.append('endDate', endDate);
        const response = await api.get(`/admin/auditlogs?${params}`);
        return response.data;
    }
};
