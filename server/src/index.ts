//app instance
import express from "express";
import authRouter from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import sweetRouter from "./routes/sweet.routes";
import  cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api",authRouter);
app.use("/api/sweets", sweetRouter);

//global error handler
app.use(errorHandler);

export default app;