import {prisma} from "../utils/prisma";
import bcrypt from "bcryptjs"

export const registerUser = async (name: string, email: string, password: string) => {
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
};