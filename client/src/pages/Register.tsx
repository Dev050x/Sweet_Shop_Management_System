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
    <div>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input placeholder="Name" {...register("name")} />
        </div>
        {errors.name && (
          <div style={{ color: "red" }}>{errors.name.message}</div>
        )}
        <div>
          <input placeholder="Email" {...register("email")} />
        </div>
        {errors.email && (
          <div style={{ color: "red" }}>{errors.email.message}</div>
        )}
        <div>
          <input placeholder="Password" type="password" {...register("password")} />
        </div>
        {errors.password && (
          <div style={{ color: "red" }}>{errors.password.message}</div>
        )}
        <div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </div>
      </form>
      <div>
        Already have an account? <button onClick={() => nav("/login")}>Login</button>
      </div>
    </div>
  );
}