import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
    userId: number;
    role: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload;
}


export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // get token from header
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "No token provided",
            });
        }

        const token = authHeader.split(" ")[1];

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

        // attach user to request
        req.user = decoded;

        next();

    } catch (error: any) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== "ADMIN") {
        return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    next();
};