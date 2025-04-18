import express from 'express';
import { changeUserPassword,
         deleteUserProfile, 
         getLikedMovies, 
         loginUser, 
         registerUser, 
         updateUserProfile,
         addLikedMovie,
         deleteLikedMovies,
         getUsers,
         deleteUser,
         googleLoginUser,
   
        }
from "../Controllers/UserController.js";
import { protect, admin } from '../middlewares/Auth.js';
import User from '../Models/UserModels.js';
import { generateToken } from '../middlewares/Auth.js';
import { authAdmin } from '../config/firebaseAdmin.js';
const router = express.Router();

//PUBLIC ROUTES
router.post("/", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLoginUser);

//PRIVATE ROUTES
router.put("/", protect, updateUserProfile);
router.delete("/", protect, deleteUserProfile);
router.put("/password", protect, changeUserPassword);
router.get("/favorites", protect, getLikedMovies);
router.post("/favorites", protect, addLikedMovie);
router.delete("/favorites", protect, deleteLikedMovies);


//ADMIN ROUTES
router.get("/", protect, admin, getUsers);
router.delete("/:id", protect, admin, deleteUser);


export default router;