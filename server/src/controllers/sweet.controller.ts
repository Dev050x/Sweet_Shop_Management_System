import { NextFunction, Request, Response } from "express";
import { sweetSchema } from "../schema/sweet.schema";
import * as sweetService from "../services/sweet.service";

//add sweet controller
export const addSweet = async (req: Request, res: Response, next: NextFunction) => {
   try {
    // validate input
    const validatedData = sweetSchema.safeParse(req.body);

    if (!validatedData.success) {
      return next(validatedData.error);
    }

    //calling service
     // call service to add sweet
    const sweet = await sweetService.addSweet(
      validatedData.data.name,
      validatedData.data.category,
      validatedData.data.price,
      validatedData.data.quantity
    );

   } catch (error) {
      next(error);
   }
};