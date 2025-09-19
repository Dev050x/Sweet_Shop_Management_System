import { Request, Response, NextFunction } from "express";


//error hanlder 
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {

    if (error.name === "ZodError") {
        //console.log("zod error");
        return res.status(400).json({
            success: false,
            message: "invalid request body",
            errors: error.format(),
        });
    }

    if (error.message === "Email already registered") {
        return res.status(409).json({
          success: false,
          message: error.message,
          errors:error
        });
    }

    if (error.message === "User not found" || error.message === "wrong password") {
        return res.status(401).json({
          success: false,
          message: error.message,
          errors:error
        });
    }


    return res.status(500).json({
        success: false,
        message: "internal server error",
        errors: error.message || "Internal Server Error",
    });

};