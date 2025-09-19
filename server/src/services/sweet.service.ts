import {prisma} from "../utils/prisma";
import { SweetCategory } from "@prisma/client";
import { SweetUpdateInput } from "../schema/sweet.schema";


//add sweets 
export const addSweet = async (name: string, category: SweetCategory, price: number, quantity: number) => {
  return prisma.sweet.create({
    data: { name, category, price, quantity },
  });
};


// get all sweets
export const getAllSweets = async () => {
  return prisma.sweet.findMany({
    orderBy: { createdAt: "desc" }, 
  });
};

//search sweets
export const searchSweets = async (
  name?: string,
  category?: SweetCategory,
  minPrice?: number,
  maxPrice?: number
) => {
  return prisma.sweet.findMany({
    where: {
      AND: [
        name ? { name: { contains: name, mode: "insensitive" } } : {},
        category ? { category: category } : {},
        minPrice !== undefined ? { price: { gte: minPrice } } : {},
        maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });
};


//update sweets details(name/category only)
export const updateSweet = async (id: number, data: SweetUpdateInput) => {
  const sweet = await prisma.sweet.findUnique({ where: { id } });
  if (!sweet) throw new Error("Sweet not found");

  return prisma.sweet.update({
    where: { id },
    data,
  });
};

//delete sweets
export const deleteSweet = async (id: number) => {
  const sweet = await prisma.sweet.findUnique({ where: { id } });
  if (!sweet) throw new Error("Sweet not found");

  return prisma.sweet.delete({
    where: { id },
  });
};


//purchase sweets
export const purchaseSweet = async (id: number, quantity: number, userId: number) => {

};