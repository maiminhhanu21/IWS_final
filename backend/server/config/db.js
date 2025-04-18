// connect MongoDB with mongoose

import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

export const connectDB= async()=>{
    try {
        const conn = await mongoose.connect('mongodb+srv://ngoclequang12345:1234@cluster0.uiu1rep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0' );
        console.log(`MongoDB Connected: ${conn.connection.host}`);
       ;
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    };

