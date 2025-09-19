import { z } from "zod";


export const registerSchema = z.object({
  name: z.string(),
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ , "Email must be in correct form"),
  password: z.string()
  .min(8, "Password must be at least 8 characters")
});