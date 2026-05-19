import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, loginUser } from "../services/authService";
import type { AuthUser, LoginRequest } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  hasAssignedRole: () => boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const storageKeys = {
  token: "sphere.auth.token",
  user: "sphere.auth.user",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.user);
  }, []);

  const saveSession = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(storageKeys.token, nextToken);
    localStorage.setItem(storageKeys.user, JSON.stringify(nextUser));
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem(storageKeys.token);

    if (!storedToken) {
      clearSession();
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const validateSession = async () => {
      try {
        const response = await getMe(storedToken);

        if (isMounted) {
          saveSession(storedToken, response.user);
        }
      } catch {
        if (isMounted) {
          clearSession();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, [clearSession, saveSession]);

  const login = async (payload: LoginRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const loginResponse = await loginUser(payload);
      const meResponse = await getMe(loginResponse.token);

      saveSession(loginResponse.token, meResponse.user);
    } catch (loginError) {
      clearSession();
      setError(loginError instanceof Error ? loginError.message : "Login failed");
      throw loginError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const refreshUser = async () => {
    if (!token) return;

    const response = await getMe(token);
    saveSession(token, response.user);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isLoading,
      error,
      hasAssignedRole: () => Boolean(user?.role),
      login,
      logout,
      refreshUser,
      clearError: () => setError(""),
    }),
    [user, token, isLoading, error, clearSession, saveSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
