import { SweetCategory } from "@prisma/client";
import { z } from "zod";


export const sweetSchema = z.object({
  name: z.string().min(2, "Sweet name must be at least 2 characters"),
  category: z.enum(SweetCategory),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.number().int().nonnegative("Quantity must be >= 0"),
});

export const sweetSearchSchema = z.object({
  name: z.string().optional(),
  category: z.enum(SweetCategory).optional(),
  minPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "minPrice must be a number")
    .transform(Number)
    .optional(),
  maxPrice: z
    .string()
    .regex(/^\d+(\.\d+)?$/, "maxPrice must be a number")
    .transform(Number)
    .optional(),
});

export const sweetUpdateSchema = z.object({
  name: z.string().min(2, "Sweet name must be at least 2 characters").optional(),
  category: z.enum(SweetCategory).optional(),
  quantity: z.number().int().positive("Quantity must be at least 1").optional(),
  price: z.number().positive("Price must be greater than 0").optional(),
}).strict();

export type SweetUpdateInput = z.infer<typeof sweetUpdateSchema>;

export const sweetPurchaseSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
}).strict();
