import { Router } from "express";
import { addSweet, getAllSweets, searchSweets } from "../controllers/sweet.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const sweetRouter = Router();


sweetRouter.post("/", authMiddleware, addSweet);                         //add sweets(user+admin)
sweetRouter.get("/", authMiddleware, getAllSweets);                      //get all sweets(user+admin)
sweetRouter.get("/search", authMiddleware, searchSweets);                //search sweets(user+admin)





export default sweetRouter;