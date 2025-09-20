import React from "react";
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
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div><input placeholder="Email" {...register("email")} /></div>
        {errors.email && <div style={{color:"red"}}>{errors.email.message}</div>}
        <div><input placeholder="Password" type="password" {...register("password")} /></div>
        {errors.password && <div style={{color:"red"}}>{errors.password.message}</div>}
        <div><button type="submit" disabled={isSubmitting}>{isSubmitting? "Logging..." : "Login"}</button></div>
      </form>
      <div>Don't have an account? <button onClick={()=>nav("/register")}>Register</button></div>
    </div>
  );
}