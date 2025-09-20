import { Router } from "express";
import { addSweet, deleteSweet, getAllSweets, purchaseSweet, restockSweet, searchSweets, updateSweet } from "../controllers/sweet.controller";
import { authMiddleware, isAdmin } from "../middlewares/auth.middleware";


const sweetRouter = Router();


sweetRouter.post("/", authMiddleware, isAdmin,addSweet);                         //add sweets(user)
sweetRouter.get("/", authMiddleware, getAllSweets);                      //get all sweets(user+admin)
sweetRouter.get("/search", authMiddleware, searchSweets);                //search sweets(user+admin)
sweetRouter.put("/:id", authMiddleware, isAdmin, updateSweet);           //update sweet details(only admin  )
sweetRouter.delete("/:id", authMiddleware, isAdmin, deleteSweet);                    //delete the sweets (admin only)
sweetRouter.post("/:id/purchase", authMiddleware, purchaseSweet);        //sweet purchase(user+admin)
sweetRouter.post("/:id/restock", authMiddleware, isAdmin, restockSweet);   ///restock sweets (admin only)

export default sweetRouter;