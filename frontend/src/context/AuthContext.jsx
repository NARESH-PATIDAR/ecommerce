import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [tokens, setTokens] = useState(() => JSON.parse(localStorage.getItem('tokens')));
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
    const [fullProfile, setFullProfile] = useState(null);

    const login = (newTokens, userData) => {
        localStorage.setItem('tokens', JSON.stringify(newTokens));
        localStorage.setItem('user', JSON.stringify(userData));
        setTokens(newTokens);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('tokens');
        localStorage.removeItem('user');
        setTokens(null);
        setUser(null);
        setFullProfile(null);
    };

    const loadProfile = async () => {
        if (!tokens) return;
        try {
            const response = await fetch('/api/users/profile/', {
                headers: { 'Authorization': `Bearer ${tokens.access}` }
            });
            if (response.ok) {
                const data = await response.json();
                setFullProfile(data);
            } else {
                logout(); // Token likely expired
            }
        } catch (err) {
            console.error('Error loading profile', err);
        }
    };

    useEffect(() => {
        if (tokens && !fullProfile) {
            loadProfile();
        }
    }, [tokens]);

    return (
        <AuthContext.Provider value={{ tokens, user, fullProfile, login, logout, loadProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
