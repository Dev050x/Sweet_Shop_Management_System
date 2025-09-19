import { NextFunction, Request, Response } from "express";


//add sweet controller
export const addSweet = async (req: Request, res: Response, next: NextFunction) => {
    console.log("request received");
};