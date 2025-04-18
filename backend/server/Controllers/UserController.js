import asyncHandler from "express-async-handler"
import User from "../Models/UserModels.js"
import bcrypt from "bcryptjs";
import axios from "axios";
import { generateToken } from "../middlewares/Auth.js";
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'; 
const TMDB_API_KEY = '0b79ae8b3eece41e4dc70ca8341bf347';
//@desc Register user
//@route POST/api/users/
//@access Public
const registerUser = asyncHandler(async (req,res)=>{
    const {fullName, email, password, image} = req.body
    try{
        const userExists = await User.findOne({email})
         //check if user exists
    if (userExists){
        res.status(400)
        throw new Error("User already exists");
    }
 
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
   
    //create user in DB
    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        image,
    });

    //if user created successfully send user data and token to client
    if (user){
        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            image: user.image,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    }
    else{
        res.status(400);
        throw new Error("Invlid user data");
    }
} catch (error){
    res.status(400).json({message: error.message});
}
   
});

//@desc Login user
//@route POST /api/users/login
//@access PUBLIC
const loginUser= asyncHandler(async (req, res) =>{
    const {email, password} = req.body;
    try{
        //find user in DB
        const user = await User.findOne({email});
        //if user exists compare password with hashed password then send user data and token to client
        if (user && (await bcrypt.compare(password, user.password))){
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                token: generateToken(user._id),
            });
            //if user not found or password not match send error message
        } else {
            res.status(401);
            throw new Error("Invalid email or password");
        }
    } catch (error){
        res.status(400).json({message: error.message});
    }
});


  
//PRIVATE CONTROLLERS
//@desc Update uer profile
//@route PUT /api/users/profile
//@access Private
const updateUserProfile = asyncHandler(async (req, res)=>{
    const {fullName, email, password, image} = req.body;
    try{
        //find user in DB
        const user = await User.findById(req.user._id);
        //if user exist update user data and save it in DB
        if(user){
            user.fullName = fullName || user.fullName;
            user.email= email|| user.email;
            user.image=image|| user.image;

            const updateUser = await user.save();
            //send updated user data and token to client
            res.json({
                _id: updateUser._id,
                fullName: updateUser.fullName,
                email: updateUser.email,
                image: updateUser.image,
                isAdmin: updateUser.isAdmin,
                token: generateToken(updateUser._id),

            });
        }
        //else send error message
        else{
            res.status(404);
            throw new Error("User not found");
        } 
    } catch(error){
        res.status(400).json({message: error.message});
    }
});

//@desc Delete user profile
//@route DELETE/api/users
//@access Private
const deleteUserProfile = asyncHandler(async (req, res)=>{
    try{
        //find user in DB
        const user = await User.findById(req.user._id);
        //if user exist in Db, Delete
        if(user){
            //if user is admin throw error message
            if(user.isAdmin){
                res.status(400);
                throw new Error("Cant delete admin user");
            }
            //else delete user
            await user.deleteOne();
            res.json({message:"User deleted successfully"});
        }
        //else send error message
        else{
            res.status(404);
            throw new Error("User not found");
        }
    } catch(error){
        res.status(400).json({message: error.message});
    }
});

//@desc Change user password
//@route PUT/api/users/password
//@access Private
const changeUserPassword = asyncHandler(async (req,res)=>{
    const {oldPassword, newPassword} = req.body;
    try{
        //find user in DB
        const user = await User.findById(req.user._id);
        //if user exists compare old password with hashed password then update user password and save it in DB
        if(user && (await bcrypt.compare(oldPassword, user.password))){
            //hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            user.password = hashedPassword;
            await user.save();
            res.json({message: "Password changed!"});
        }
        //else send error message
        else{
            res.status(401);
            throw new Error("Invalid old password");
        }
    } catch(error){
        res.status(400).json({message: error.message});
    }
});

//@desc get all liked movies
//@route GET/api/users/favorites
//@access Private
const getLikedMovies = asyncHandler(async (req, res) => {
    try {
        // Find the user in the database
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        // user.likedMovies is an array of TMDB movie IDs (numbers)
        // For each ID, call the TMDB API to get the movie details
        const moviePromises = user.likedMovies.map(id =>
            axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
                params: { api_key: TMDB_API_KEY }
            })
        );
        const moviesResponses = await Promise.all(moviePromises);
        const moviesData = moviesResponses.map(response => response.data);
        res.json(moviesData);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


//@desc Add movie to liked movie
//@route POST/api/users/favorites
//@access Private
const addLikedMovie = asyncHandler(async (req, res) => {
    const { movieId } = req.body;
    
    // Validate that movieId is provided
    if (movieId === undefined || movieId === null) {
        res.status(400);
        throw new Error("Valid movieId is required");
    }
    
    try {
        // Find the user in the database
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        
        // Clean the likedMovies array to remove any null values
        user.likedMovies = user.likedMovies.filter(id => id !== null);
        
        // Check if the movie is already liked (using the cleaned array)
        if (user.likedMovies.includes(movieId)) {
            res.status(400);
            throw new Error("Movie already liked");
        }
        
        // Add the movieId to the likedMovies array
        user.likedMovies.push(movieId);
        await user.save();
        res.json(user.likedMovies);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//@desc delete all liked movie
//@route DELETE/api/users/favorites
//@access Private
const deleteLikedMovies = asyncHandler(async (req, res) => {
    const { movieId } = req.body;
    
    // Validate that movieId is provided
    if (movieId === undefined || movieId === null) {
        res.status(400);
        throw new Error("Movie ID is required to remove a liked movie");
    }

    try {
        // Find the user in the database
        const user = await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        
        // Remove the specific movie from the likedMovies array
        // If likedMovies are stored as numbers (TMDB IDs), compare directly
        // Otherwise, if they are ObjectIds, you might need to convert movieId to a string for comparison
        const initialLength = user.likedMovies.length;
        user.likedMovies = user.likedMovies.filter(id => id !== movieId);
        
        // If nothing was removed, return an error
        if (user.likedMovies.length === initialLength) {
            res.status(404);
            throw new Error("Movie not found in liked movies");
        }
        
        await user.save();
        res.json({ message: "Movie removed from liked movies successfully", likedMovies: user.likedMovies });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//ADMIN CONTROLLER
//@desc Get all users
//@route GET /api/users
//@access Private/Admin
const getUsers = asyncHandler(async (req,res) =>{
    try{
        //find all user in DB
        const users = await User.find({});
        res.json(users);
    } catch(error){
        res.status(400).json({message: error.message});
    }
});

//@desc Delete users
//@route Delete/api/users/:id
//@access Private/Admin
const deleteUser = asyncHandler(async(req,res)=>{
    try{
        //find user in DB
        const user = await User.findById(req.params.id);
        //if user exists delete user from DB
        if(user){
            //if user is admin throw error message
            if(user.isAdmin){
                res.status(400);
                throw new Error("Can't delete admin user");
            }
            // else delete user from DB
            await user.deleteOne();
            res.json({message:"User deleted successfully"});
        }
        //else send error message
        else{
            res.status(404);
            throw new Error("User not found");
        }
    } catch(error){
        res.status(400).json({message: error.message});
    }
});




export {registerUser, 
        loginUser, 
        updateUserProfile, 
        deleteUserProfile, 
        changeUserPassword, 
        getLikedMovies,
        addLikedMovie,
        deleteLikedMovies,
        getUsers,
        deleteUser,

    };