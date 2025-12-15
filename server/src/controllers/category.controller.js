import { Category } from "../model/schema.js";

// CREATE CATEGORY 
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Name of category is required" })
        let image = req.file ? req.file.filename : null;

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await Category.create({ name, image });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {
       console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// UPDATE CATEGORY 
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    
    const exists = await Category.findOne({ name, _id: { $ne: id } });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    let updateObj = { name };
    if (req.file) updateObj.image = req.file.filename;

    const updated = await Category.findByIdAndUpdate(id, updateObj, { new: true });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      updated
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


// DELETE CATEGORY

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (error) {
        console.log(error);
        
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.log("Get Categories Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server problem."
    });
  }
};


export const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findById(id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Category fetched successfully",
            category
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};