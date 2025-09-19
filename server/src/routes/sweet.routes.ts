import { Router } from "express";
import { addSweet, getAllSweets, searchSweets, updateSweet } from "../controllers/sweet.controller";
import { authMiddleware, isAdmin } from "../middlewares/auth.middleware";


const sweetRouter = Router();


sweetRouter.post("/", authMiddleware, addSweet);                         //add sweets(user+admin)
sweetRouter.get("/", authMiddleware, getAllSweets);                      //get all sweets(user+admin)
sweetRouter.get("/search", authMiddleware, searchSweets);                //search sweets(user+admin)
sweetRouter.put("/:id", authMiddleware, isAdmin, updateSweet);           //update sweet details(only admin  )




export default sweetRouter;