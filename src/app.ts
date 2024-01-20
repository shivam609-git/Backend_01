import express from "express";

//Importing routes
import userRoutes from './routes/user.js'
import productRoute from "./routes/products.js";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";
import NodeCache from "node-cache";

const port = 8000;

connectDB();
export const myCache = new NodeCache();

const app = express();

app.use(express.json());

app.get("/",(req,res) => {
    res.send("API Working /api/v1")
})
//Using Routes
app.use("/api/v1/user",userRoutes);
app.use("/api/v1/product",productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads",express.static("uploads"))
app.use(errorMiddleware);

app.listen(port,()=>{
    console.log(`express is working on http://localhost:${port}`)
})