import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiFetch, ApiError } from "./api";
import { AuthModal } from "../components/auth-modal";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const pendingRef = useRef(null); // { action, resolve, reject }

  // On first load, check whether a session cookie is already valid.
  useEffect(() => {
    let cancelled = false;
    apiFetch("/auth/me")
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(
    async (name, email, password, termsAccepted, age, phone) => {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: { name, email, password, termsAccepted, age, phone },
      });
      setUser(data.user);
      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    const data = await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
    return data.message;
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    const data = await apiFetch("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
    // A successful reset issues a fresh session cookie on the backend —
    // pull the now-logged-in user so the app reflects that immediately.
    try {
      const me = await apiFetch("/auth/me");
      setUser(me.user);
    } catch {
      // Not fatal — the person can still log in manually if this fails.
    }
    return data;
  }, []);

  // Runs `action` immediately if the user is already signed in. Otherwise
  // opens the auth modal and holds `action` until the user signs in
  // successfully (then runs it and resolves), or closes the modal without
  // signing in (then rejects with a "cancelled" error).
  const requireAuth = useCallback(
    (action) => {
      if (user) return Promise.resolve(action());
      return new Promise((resolve, reject) => {
        pendingRef.current = { action, resolve, reject };
        setModalOpen(true);
      });
    },
    [user],
  );

  const openAuthModal = useCallback(() => {
    pendingRef.current = null;
    setModalOpen(true);
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setModalOpen(false);
    if (pending) {
      try {
        const result = await pending.action();
        pending.resolve(result);
      } catch (err) {
        pending.reject(err);
      }
    }
  }, []);

  const handleModalClose = useCallback(() => {
    const pending = pendingRef.current;
    pendingRef.current = null;
    setModalOpen(false);
    if (pending) pending.reject(new Error("cancelled"));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        requireAuth,
        openAuthModal,
      }}
    >
      {children}
      {modalOpen && (
        <AuthModal onSuccess={handleAuthSuccess} onClose={handleModalClose} />
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError };
