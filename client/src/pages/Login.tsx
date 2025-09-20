import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../api";
import { useAuth } from "../context /AuthContext";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "../validation/schema";
import type {LoginInput} from "../validation/schema";

export default function Login(){
  const nav = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState:{ errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    try{
      const res = await api.post("/api/auth/login", data);
      const token: string = res.data.token;
      if (!token) throw new Error("No token received");
      login(token);
      nav("/"); // redirect to dashboard or home
    }catch(err:any){
      const msg = err?.response?.data?.message ?? err?.message ?? "Login failed";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#BCC7DC] to-[#F2F4F7]">
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg" style={{ backgroundColor: "#F2F4F7" }}>
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "#0D3253" }}>
          Login
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              placeholder="Email"
              {...register("email")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{
                borderColor: "#BCC7DC",
                backgroundColor: "#FFFFFF",
                color: "#222222",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5CC5D5")}
              onBlur={(e) => (e.target.style.borderColor = "#BCC7DC")}
            />
          </div>
          {errors.email && (
            <div className="text-sm" style={{ color: "red" }}>
              {errors.email.message}
            </div>
          )}
          <div>
            <input
              placeholder="Password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{
                borderColor: "#BCC7DC",
                backgroundColor: "#FFFFFF",
                color: "#222222",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#5CC5D5")}
              onBlur={(e) => (e.target.style.borderColor = "#BCC7DC")}
            />
          </div>
          {errors.password && (
            <div className="text-sm" style={{ color: "red" }}>
              {errors.password.message}
            </div>
          )}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: "#0D3253",
                color: "#FFFFFF",
              }}
            >
              {isSubmitting ? "Logging..." : "Login"}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center" style={{ color: "#333333" }}>
          Don't have an account?{" "}
          <button
            onClick={() => nav("/register")}
            className="font-medium hover:underline transition-colors"
            style={{ color: "#5CC5D5" }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}