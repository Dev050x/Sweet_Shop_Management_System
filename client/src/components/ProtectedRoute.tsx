import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context /AuthContext";

export const ProtectedRoute: React.FC<{ children: React.ReactElement, requiredRole?: string }> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole) {
    const role = String(user?.role ?? "").toUpperCase();
    if (role !== requiredRole.toUpperCase()) return <Navigate to="/" replace />;
  }
  return children;
};