// controllers/supplier.controller.js
import { Supplier } from "../model/schema.js";

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true });
    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Get suppliers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching suppliers",
    });
  }
};

// Get popular suppliers
export const getPopularSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true, isPopular: true });
    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Get popular suppliers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching popular suppliers",
    });
  }
};

// Get trending suppliers
export const getTrendingSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({ isActive: true, isTrending: true });
    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Get trending suppliers error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching trending suppliers",
    });
  }
};

// Create supplier (Admin only)
export const createSupplier = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      location,
      rating,
      reviews,
      contactInfo,
      isPopular,
      isTrending,
    } = req.body;

    const imageFile = req.file ? req.file.path : "";

    const supplier = await Supplier.create({
      name,
      category,
      description,
      location,
      image: imageFile,
      rating: rating || 5,
      reviews: reviews || 0,
      contactInfo,
      isPopular: isPopular || false,
      isTrending: isTrending || false,
    });

    res.status(201).json({
      success: true,
      message: "Supplier created successfully",
      supplier,
    });
  } catch (error) {
    console.error("Create supplier error:", error);
    res.status(500).json({
      success: false,
      message: "Server error creating supplier",
    });
  }
};

// Update supplier (Admin only)
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (req.file) {
      updates.image = req.file.path;
    }

    const supplier = await Supplier.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier,
    });
  } catch (error) {
    console.error("Update supplier error:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating supplier",
    });
  }
};

// Delete supplier (Admin only)
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Supplier deleted successfully",
    });
  } catch (error) {
    console.error("Delete supplier error:", error);
    res.status(500).json({
      success: false,
      message: "Server error deleting supplier",
    });
  }
};

// Get suppliers by category
export const getSuppliersByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const suppliers = await Supplier.find({ category, isActive: true });
    res.status(200).json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Get suppliers by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching suppliers by category",
    });
  }
};
