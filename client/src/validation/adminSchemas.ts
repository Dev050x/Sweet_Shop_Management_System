// src/validation/adminSchemas.ts
import { z } from "zod";

export const addSweetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category required"),
  price: z.number().positive("Price must be > 0"),
  quantity: z.number().int().nonnegative("Quantity must be >= 0"),
});
export type AddSweetInput = z.infer<typeof addSweetSchema>;

export const updateSweetSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().nonnegative().optional(),
}).refine(obj => Object.keys(obj).length > 0, { message: "At least one field required" });
export type UpdateSweetInput = z.infer<typeof updateSweetSchema>;

export const restockSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
});
export type RestockInput = z.infer<typeof restockSchema>;