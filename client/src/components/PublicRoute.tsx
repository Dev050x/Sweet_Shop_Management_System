import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context /AuthContext";
import Toast from "./Toast";

export const PublicRoute: React.FC<{ children: React.ReactElement; redirectTo?: string }> =
  ({ children, redirectTo = "/" }) => {
    const { isAuthenticated } = useAuth();
    const nav = useNavigate();
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
      if (isAuthenticated) {
        setShowToast(true);
        const id = setTimeout(() => {
          setShowToast(false);
          nav(redirectTo, { replace: true });
        }, 1000);
        return () => clearTimeout(id);
      }
    }, [isAuthenticated, nav, redirectTo]);

    if (isAuthenticated) {
      // keep rendering the toast while waiting; don't render auth page
      return <>
        {showToast && <Toast message="You're already logged in — redirecting to dashboard" />}
        {/* render nothing else while redirecting */}
      </>;
    }

    return children;
  };