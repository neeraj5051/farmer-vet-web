import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginApi } from '../services/authService';

interface User {
    id: string;
    phone_number: string;
    role: string;
    first_name?: string;
    last_name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (phone: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Hydrate user on load if token exists
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user'); // Or fetch from api
        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (phone: string, password: string) => {
        const data = await loginApi(phone, password);
        if (data.access_token) {
            const accessToken = data.access_token;
            setToken(accessToken);
            localStorage.setItem('token', accessToken);

            const userData = {
                id: data.user_id,
                phone_number: phone,
                role: data.role,
                first_name: data.first_name,
                last_name: data.last_name
            };
            setUser(userData as User);
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
