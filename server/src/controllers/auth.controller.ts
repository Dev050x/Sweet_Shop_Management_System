import { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "../schema/auth.schema";
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

    return res.status(201).json({
      success:true,
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error); 
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // validate the schema
    const validatedData = loginSchema.safeParse(req.body);

    if (!validatedData.success) {
      return next(validatedData.error);
    }

    const token = await service.loginUser(
      validatedData.data.email,
      validatedData.data.password
    );

    return res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    next(error); 
  }
};