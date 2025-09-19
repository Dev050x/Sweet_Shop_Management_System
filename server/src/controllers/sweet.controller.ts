import { NextFunction, Request, Response } from "express";
import { sweetSchema, sweetSearchSchema, sweetUpdateSchema } from "../schema/sweet.schema";
import * as sweetService from "../services/sweet.service";
import { AuthRequest } from "../middlewares/auth.middleware";


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

    res.json({
      success:true,
      message: "Sweets search results",
      sweets,
    });

  } catch (error) {
    next(error)
  }


};


//updating sweet detail()
export const updateSweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
  
    // validate update body
    const validatedData = sweetUpdateSchema.safeParse(req.body);
    if (!validatedData.success) {
      return next(validatedData.error);
    }

    const sweet = await sweetService.updateSweet(id, validatedData.data);

    res.json({
      success:true,
      message: "Sweet updated successfully",
      sweet,
    });

  } catch (error) {
    next(error)
  }

};


//deleting the sweets(only admin)
export const deleteSweet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);

    await sweetService.deleteSweet(id);

    res.json({
      success:true,
      message: "Sweet deleted successfully",
    });

  } catch (error) {
    next(error); 
  }
};

//purchase sweet handler
export const purchaseSweet = async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log("received request");
};