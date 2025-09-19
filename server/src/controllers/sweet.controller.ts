import { NextFunction, Request, Response } from "express";
import { sweetSchema } from "../schema/sweet.schema";


//add sweet controller
export const addSweet = async (req: Request, res: Response, next: NextFunction) => {
   try {
    // validate input
    const validatedData = sweetSchema.safeParse(req.body);

    if (!validatedData.success) {
      return next(validatedData.error);
    }
   } catch (error) {
      next(error);
   }
};