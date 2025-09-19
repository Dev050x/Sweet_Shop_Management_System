import { SweetCategory } from "@prisma/client";
import { z } from "zod";


export const sweetSchema = z.object({
  name: z.string().min(2, "Sweet name must be at least 2 characters"),
  category: z.enum(SweetCategory),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.number().int().nonnegative("Quantity must be >= 0"),
});