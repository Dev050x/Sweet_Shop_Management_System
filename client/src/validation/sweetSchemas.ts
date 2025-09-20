import { z } from "zod";

export const sweetPurchaseSchema = z.object({
  quantity: z.number().int().positive("Quantity must be at least 1"),
});
export type SweetPurchaseInput = z.infer<typeof sweetPurchaseSchema>;

export type Sweet = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
};
