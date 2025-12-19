import express from "express";

import { createCategory, deleteCategory, getCategories, getSingleCategory, updateCategory } from "../controllers/category.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleCheckMiddleware.js";

const router = express.Router();


router.post("/create-category",protect, authorize("organizer","admin"), upload.single("image"), createCategory);
router.get("/get-category", protect, getCategories);
router.get("/get-single-category/:id", protect, getSingleCategory);
router.put("/update-category/:id", protect, authorize("organizer","admin"), upload.single("image"), updateCategory);
router.delete("/delete-category/:id",protect, authorize("organizer","admin"), deleteCategory);


export default router
