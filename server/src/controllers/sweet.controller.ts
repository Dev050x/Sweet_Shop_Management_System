import { NextFunction, Request, Response } from "express";
import { sweetSchema, sweetSearchSchema } from "../schema/sweet.schema";
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
  try {
    const sweets = await sweetService.getAllSweets();
    res.json({
      success:true,
      message: "Sweets fetched successfully",
      sweets,
    });

  } catch (error) {
    next(error); 
  }
};

//search by either name or category or price range
export const searchSweets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate query params
    const validatedQuery = sweetSearchSchema.safeParse(req.query);
    if (!validatedQuery.success) {
      return next(validatedQuery.error);
    }

    const sweets = await sweetService.searchSweets(
      validatedQuery.data.name,
      validatedQuery.data.category,
      validatedQuery.data.minPrice,
      validatedQuery.data.maxPrice
    );

    if(sweets.length == 0) {
        return res.json({
            success:true,
            message:"there is no sweets",
            sweets:[]
        })
    }


  } catch (error) {
  }
};