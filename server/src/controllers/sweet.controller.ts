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

    // call service to add sweet
    const sweet = await sweetService.addSweet(
      validatedData.data.name,
      validatedData.data.category,
      validatedData.data.price,
      validatedData.data.quantity
    );

    res.status(201).json({
      success:true,
      message: "Sweet added successfully",
      sweet,
    });

   } catch (error) {
      next(error);
   }
};



//get all sweets handler
export const getAllSweets = async (req: Request, res: Response, next: NextFunction) => {
  console.log("receiving request");
};