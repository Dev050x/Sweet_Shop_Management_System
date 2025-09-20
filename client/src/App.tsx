import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context /AuthContext";
import { SweetProvider } from "./context /SweetContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Login = lazy(()=>import("./pages/Login"));
const Register = lazy(()=>import("./pages/Register"));
const Dashboard = lazy(()=>import("./pages/Dashboard"));

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <SweetProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<Login/>} />
              <Route path="/register" element={<Register/>} />
              <Route path="/" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </SweetProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}