/**
 * useAuth — lightweight auth context without Redux.
 * Stores user + token in localStorage.
 * Provides: user, isAuthenticated, isAdmin, login, logout, register
 */

import React, { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("fixmycity_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "ADMIN";

  const login = useCallback((token, userData) => {
    localStorage.setItem("fixmycity_token", token);
    localStorage.setItem("fixmycity_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("fixmycity_token");
    localStorage.removeItem("fixmycity_user");
    setUser(null);
  }, []);

  const value = { user, isAuthenticated, isAdmin, login, logout };
  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

/**
 * Redirect to login if not authenticated (simple protected route).
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    // Use window.location for simplicity (React Router's Navigate needs a router)
    window.location.href = "/login";
    return null;
  }
  return children;
}

/**
 * Redirect to admin dashboard if not admin.
 */
export function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    window.location.href = "/dashboard";
    return null;
  }
  return children;
}