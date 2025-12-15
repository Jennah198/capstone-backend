import { Venue } from "../model/schema.js";


// Create a new venue-----> FOR ORGANIZERS,ADMIN
export const createVenue = async (req, res) => {
    try {
        const { name, address, city, country, capacity } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Venue name is required" });
        }
        if (!address) {
            return res.status(400).json({ success: false, message: "address is required" });
        }
        if (!city) {
            return res.status(400).json({ success: false, message: "city is required" });
        }
        if (!country) {
            return res.status(400).json({ success: false, message: "country is required" });
        }
        if (!capacity) {
            return res.status(400).json({ success: false, message: "capacity is required" });
        }

        const imageFile = req.file ? req.file.filename : "";


        const venue = await Venue.create({
            name,
            image: imageFile,
            address,
            city,
            country,
            capacity
        });

        res.status(201).json({
            success: true,
            message: "Venue created successfully",
            venue
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// get  venues--------> FOR USERS,ORGANIZERS,ADMIN
export const getVenue = async (req, res) => {
    try {

        const venues = await Venue.find({});

        res.status(200).json({
            success: true,
            message: "Venues fetched successfully",
            venues
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


export const getVenueById = async (req, res) => {
    try {
        const { id } = req.params
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: "Venue not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Venue fetched successfully",
            venue
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


export const updateVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, city, country, capacity } = req.body;

        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: "Venue not found"
            });
        }

        venue.name = name || venue.name;
        venue.address = address || venue.address;
        venue.city = city || venue.city;
        venue.country = country || venue.country;
        venue.capacity = capacity || venue.capacity;

        if (req.file) {
            venue.image = req.file.filename;
        }

        await venue.save();

        res.status(200).json({
            success: true,
            message: "Venue updated successfully",
            venue
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Problem" });
    }
};



// delete venue --------> FOR ORGANIZERS,ADMIN

export const deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const venue = await Venue.findByIdAndDelete(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: "Venue not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Venue deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};