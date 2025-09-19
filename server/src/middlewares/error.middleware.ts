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

};