import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { roleCheck } from "../middlewares/roleCheckMiddleware.js";
import {
  getAllSuppliers,
  getPopularSuppliers,
  getTrendingSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSuppliersByCategory,
} from "../controllers/supplier.controller.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.get("/all", getAllSuppliers);
router.get("/popular", getPopularSuppliers);
router.get("/trending", getTrendingSuppliers);
router.get("/category/:category", getSuppliersByCategory);

// Admin only routes
router.post(
  "/create",
  protect,
  roleCheck(["admin"]),
  upload.single("image"),
  createSupplier
);
router.put(
  "/update/:id",
  protect,
  roleCheck(["admin"]),
  upload.single("image"),
  updateSupplier
);
router.delete("/delete/:id", protect, roleCheck(["admin"]), deleteSupplier);

export default router;
