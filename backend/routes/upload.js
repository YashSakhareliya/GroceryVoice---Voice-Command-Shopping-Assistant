import express from "express";
import upload from "../middleware/upload.js";
import { uploadImage, uploadImages, deleteImage } from "../controllers/uploadController.js";
import {protect} from '../middleware/auth.js';

const router = express.Router();

router.post("/single", protect, upload.single("image"), uploadImage);
router.post("/multiple", protect, upload.array("images", 10), uploadImages);
router.delete("/:publicId", protect, deleteImage);

export default router;