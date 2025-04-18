import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import {connectDB} from "./config/db.js";
import userRouter from "./Routers/UserRouter.js";
import { errorHandler } from './middlewares/errorMiddleware.js';
import movieRoutes from './Routers/MoviesRouter.js';
import mongoose from 'mongoose';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// coneect Db
connectDB();

//Main route
app.get("/", (req,res)=>{
    res.send("API is running...");
});

// other routes
app.use("/api/users", userRouter);
app.use('/api/movies', movieRoutes);

// error handling middleware
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>{
    console.log(`Server running is http://localhost/${PORT}`);
});