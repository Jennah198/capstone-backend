import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createCategory, deleteCategory, getCategories, getSingleCategory, updateCategory } from "../controllers/category.controller.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();


router.post("/create-category", upload.single("image"), createCategory);
router.get("/get-category", getCategories);
router.get("/get-single-category/:id", getSingleCategory);
router.put("/update-category/:id", upload.single("image"), updateCategory);
router.delete("/delete-category/:id", deleteCategory);


export default router
