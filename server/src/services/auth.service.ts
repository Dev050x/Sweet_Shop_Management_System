import {prisma} from "../utils/prisma";

export const registerUser = async (name: string, email: string, password: string) => {
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

};