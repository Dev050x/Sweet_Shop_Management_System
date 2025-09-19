//app instance
import express from "express";
import authRouter from "./routes/auth.routes";
import { errorHandler } from "./middlewares/error.middleware";
import sweetRouter from "./routes/sweet.routes";

const app = express();

app.use(express.json());

app.use("/api",authRouter);
app.use("/api/sweets", sweetRouter);

//global error handler
app.use(errorHandler);

export default app;