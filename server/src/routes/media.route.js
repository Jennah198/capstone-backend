import { Router } from "express";
import { createMedia, getAllMedia, deleteMedia } from "../controllers/media.controller.js";
import upload from "../middlewares/uploadMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleCheckMiddleware.js";

const router = Router();

router.get("/get-all", getAllMedia);
router.post("/create", protect, authorize("admin"), upload.single("media"), createMedia);
router.delete("/delete/:id", protect, authorize("admin"), deleteMedia);

export default router;
