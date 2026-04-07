import { useState, useEffect } from 'react';
import { authService, userService } from '../services/api';
export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    useEffect(() => {
        const initAuth = async () => {
            if (authService.isAuthenticated()) {
                setIsAuthenticated(true);
                try {
                    const user = await userService.getUserDetail();
                    setUserRole(user.role ?? 0);
                }
                catch (err) {
                    console.error('Error fetching user role:', err);
                    setUserRole(0);
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);
    const login = async (userName, password) => {
        await authService.login(userName, password);
        setIsAuthenticated(true);
        try {
            const user = await userService.getUserDetail();
            setUserRole(user.role ?? 0);
        }
        catch (err) {
            console.error('Error fetching user role after login:', err);
            setUserRole(0);
        }
    };
    const logout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setUserRole(null);
    };
    return { isAuthenticated, loading, login, logout, userRole, isAdmin: userRole === 1 };
};
