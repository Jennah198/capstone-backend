import { Media } from "../model/schema.js";

export const createMedia = async (req, res) => {
    try {
        const { title, description, type } = req.body;
        if (!title) return res.status(400).json({ success: false, message: "Title is required" });
        if (!req.file) return res.status(400).json({ success: false, message: "Media file is required" });

        const media = await Media.create({
            title,
            description,
            type: type || "image",
            url: req.file.path,
        });

        res.status(201).json({ success: true, message: "Media created successfully", media });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const getAllMedia = async (req, res) => {
    try {
        const media = await Media.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: media.length, media });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Media.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, message: "Media not found" });
        res.status(200).json({ success: true, message: "Media deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
