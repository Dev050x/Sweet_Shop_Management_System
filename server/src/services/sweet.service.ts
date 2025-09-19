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