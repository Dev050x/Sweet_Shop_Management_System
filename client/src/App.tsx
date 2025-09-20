import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context /AuthContext";
import { SweetProvider } from "./context /SweetContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicRoute } from "./components/PublicRoute";
import Navbar from "./components/Navbar";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SweetProvider>
          <Navbar />
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<PublicRoute redirectTo="/"><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute redirectTo="/"><Register /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPanel /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </SweetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}