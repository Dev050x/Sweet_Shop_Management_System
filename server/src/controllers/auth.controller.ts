import { NextFunction, Request, Response } from "express";
import { registerSchema } from "../schema/auth.schema";


export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the schema
    const validatedData = registerSchema.safeParse(req.body);

    if(!validatedData.success){
      return next(validatedData.error);
    }


  } catch (error) {
    next(error); 
  }
};