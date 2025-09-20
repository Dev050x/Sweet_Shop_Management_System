import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../validation/schema";
import type { RegisterInput } from "../validation/schema";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const res = await api.post("/api/auth/register", data);
      alert(res.data.message ?? "Registered");
      nav("/login");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Registration failed";
      alert(msg);
    }
  };

  return (
     <div className="min-h-screen bg-gradient-to-b from-[#BCC7DC] to-[#F2F4F7] flex items-center justify-center p-4">
      <div className="bg-[#F2F4F7] rounded-xl shadow-2xl p-8 w-full max-w-md border border-[#DDDDDD]">
        <h2 className="text-3xl font-bold text-center mb-6 text-[#000000]">Sweet Shop Management</h2>
        <h2 className="text-2xl font-bold text-center mb-8 text-[#333333]">
          Create <span className="text-[#5CC5D5]">Account</span>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <input
              placeholder="Name"
              {...register("name")}
              className="w-full px-4 py-3 border border-[#BCC7DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent transition-all duration-200 text-[#222222] placeholder-[#3E4C65] bg-white"
            />
            {errors.name && <div className="text-red-500 text-sm font-medium">{errors.name?.message as string}</div>}
          </div>

          <div className="space-y-2">
            <input
              placeholder="Email"
              type="email"
              {...register("email")}
              className="w-full px-4 py-3 border border-[#BCC7DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent transition-all duration-200 text-[#222222] placeholder-[#3E4C65] bg-white"
            />
            {errors.email && <div className="text-red-500 text-sm font-medium">{errors.email?.message as string}</div>}
          </div>

          <div className="space-y-2">
            <input
              placeholder="Password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-3 border border-[#BCC7DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent transition-all duration-200 text-[#222222] placeholder-[#3E4C65] bg-white"
            />
            {errors.password && (
              <div className="text-red-500 text-sm font-medium">{errors.password?.message as string}</div>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0D3253] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#00143D] focus:outline-none focus:ring-2 focus:ring-[#5CC5D5] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <span className="text-[#3E4C65]">Already have an account? </span>
          <button
            onClick={() => nav("/login")}
            className="text-[#5CC5D5] hover:text-[#0D3253] font-semibold transition-colors duration-200 underline decoration-2 underline-offset-2"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}