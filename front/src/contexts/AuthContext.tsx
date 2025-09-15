import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api'; // ✅ use the shared axios client (points to Render)

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Set token header for our shared client
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // ✅ always include /api prefix
          const res = await api.get('/api/auth/me');
          // handle payload shape { data: { ...user } } or { user: ... }
          const u = res.data?.data ?? res.data?.user ?? null;
          setUser(u);
          setIsAuthenticated(Boolean(u));
        } catch {
          // Token invalid/expired
          localStorage.removeItem('token');
          setToken(null);
          delete api.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (email: string, password: string) => {
    // ❗ Use the shared client + /api path (NOT axios.post('/api/...'))
    const res = await api.post('/api/auth/login', { email, password });

    // accept either { success, token, user } or { token, user }
    const ok = res.data?.success ?? true;
    if (ok) {
      const jwt = res.data?.token;
      if (jwt) {
        localStorage.setItem('token', jwt);
        setToken(jwt);
        api.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
      }

      // fetch current user (if not already returned)
      const u =
        res.data?.user ??
        (await api.get('/api/auth/me')).data?.data ??
        null;

      setUser(u);
      setIsAuthenticated(Boolean(u));
      return;
    }

    // if backend sends an error shape
    throw new Error(res.data?.error || 'Login failed');
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
