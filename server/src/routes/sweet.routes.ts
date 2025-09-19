import { Router } from "express";
import { addSweet } from "../controllers/sweet.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const sweetRouter = Router();


sweetRouter.post("/", authMiddleware, addSweet);                         //add sweets(user+admin)


export default sweetRouter;