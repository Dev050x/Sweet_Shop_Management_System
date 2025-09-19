import {prisma} from "../utils/prisma";
import { SweetCategory } from "@prisma/client";


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
export const updateSweet = async () => {

};