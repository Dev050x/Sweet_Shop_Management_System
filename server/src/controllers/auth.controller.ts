import { NextFunction, Request, Response } from "express";
import { registerSchema } from "../schema/auth.schema";
import * as service from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the schema
    const validatedData = registerSchema.safeParse(req.body);

    if(!validatedData.success){
      return next(validatedData.error);
    }

    const { name, email, password } = validatedData.data;

    const user = await service.registerUser(name,email,password);

  } catch (error) {
    next(error); 
  }
};