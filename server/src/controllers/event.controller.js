import { Event } from "../model/schema.js";



// Create Event--------> FOR ORGANIZER
export const createEvent = async (req, res) => {
    try {
        const { title, description, isPublished, category, venue, startDate, endDate, normalPrice, vipPrice } = req.body;

        const id = req.user.id
        if(!id){
            console.log("Id not found");
            return res.status(400).json({ success: false, message: "Organizer ID not found" });
        }
        let parsedNormalPrice = null;
        let parsedVipPrice = null;

        if (normalPrice) {
            try {
                parsedNormalPrice = JSON.parse(normalPrice);
            } catch (parseError) {
                console.error("Error parsing normalPrice:", parseError);
                return res.status(400).json({
                    success: false,
                    message: "Invalid normalPrice format"
                });
            }
        }

        if (vipPrice) {
            try {
                parsedVipPrice = JSON.parse(vipPrice);
            } catch (parseError) {
                console.error("Error parsing vipPrice:", parseError);
                return res.status(400).json({
                    success: false,
                    message: "Invalid vipPrice format"
                });
            }
        }


        const imageFile = req.file ? req.file.filename : "";
        const event = await Event.create({
            title,
            description,
            organizer: id, 
            category,
            venue,
            startDate,
            endDate,
            image: imageFile,
            normalPrice:parsedNormalPrice,
            vipPrice:parsedVipPrice,
            isPublished
        });

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            eventId: event._id
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Problem" });
    }
};


// Delete Event ------> FOR ORGANIZER
export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        const event = await Event.findByIdAndDelete(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Problem" });
    }
};




//  UPDATE EVENT ------> FOR ORGANIZER
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if event exists
    const existingEvent = await Event.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }


    const {
      title,
      description,
      isPublished,
      category,
      venue,
      startDate,
      endDate,
      normalPrice,
      vipPrice
    } = req.body;

   
    const updateData = {};

    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isPublished !== undefined) updateData.isPublished = isPublished === 'true';
    if (category !== undefined) updateData.category = category;
    if (venue !== undefined) updateData.venue = venue;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;

   
    if (req.file) {
      updateData.images = req.file.filename;
    }

  
    if (normalPrice !== undefined) {
      if (normalPrice && normalPrice.trim() !== '') {
        try {
          const parsed = JSON.parse(normalPrice);
          updateData.normalPrice = {
            price: parsed.price || 0,
            quantity: parsed.quantity || 0
          };
        } catch (error) {
          console.error('Error parsing normalPrice:', error);
        }
      } else {
        updateData.normalPrice = {
          price: 0,
          quantity: 0
        };
      }
    }

   
    if (vipPrice !== undefined) {
      if (vipPrice && vipPrice.trim() !== '') {
        try {
          const parsed = JSON.parse(vipPrice);
          updateData.vipPrice = {
            price: parsed.price || 0,
            quantity: parsed.quantity || 0
          };
        } catch (error) {
          console.error('Error parsing vipPrice:', error);
        }
      } else {
        updateData.vipPrice = {
          price: 0,
          quantity: 0
        };
      }
    }

    if(req.file){
      updateData.image = req.file.filename;
    }

   
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name')
     .populate('venue', 'name city')
     .populate('organizer', 'name email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });

  } catch (error) {
    console.log('Error updating event:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal Server Problem',
    });
  }
};



// GET ALL EVENTS--------> FOR USERS,ORGANIZERS,ADMIN
export const getAllEvents = async (req, res) => {
  try {
    const {
      search = '',
      status = 'all',
      category = '',
      dateRange = 'all',
      organizer = ''
    } = req.query;

   
    const query = {};

    // Search by title only 
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by category
    if (category && category !== '' && category !== 'all') {
      query.category = category;
    }

    // Filter by organizer
    if (organizer) {
      query.organizer = organizer;
    }

    // Filter by status
    if (status && status !== 'all') {
      const now = new Date();
      
      switch (status) {
        case 'draft':
          query.isPublished = false;
          break;
        case 'published':
          query.isPublished = true;
          break;
        case 'upcoming':
          query.isPublished = true;
          query.startDate = { $gt: now };
          break;
        case 'ongoing':
          query.isPublished = true;
          query.startDate = { $lte: now };
          query.$or = [
            { endDate: null },
            { endDate: { $gt: now } }
          ];
          break;
        case 'completed':
          query.isPublished = true;
          query.endDate = { $lt: now };
          break;
        case 'cancelled':
          query.status = 'cancelled';
          break;
      }
    }

    // Filter by date range
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let startDate, endDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          query.startDate = { $gte: startDate, $lte: endDate };
          break;
        case 'week':
          startDate = new Date();
          endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          query.startDate = { $gte: startDate, $lte: endDate };
          break;
        case 'month':
          startDate = new Date();
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          query.startDate = { $gte: startDate, $lte: endDate };
          break;
        case 'past':
          query.startDate = { $lt: now };
          break;
        case 'future':
          query.startDate = { $gt: now };
          break;
      }
    }

   
    const sort = { createdAt: -1 };

   
    const events = await Event.find(query)
      .populate('category', 'name')
      .populate('venue', 'name city')
      .populate('organizer', 'name email')
      .sort(sort)
      .lean();

   
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      category: event.category,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      image: event.images,
      normalPrice: event.normalPrice,
      vipPrice: event.vipPrice,
      isPublished: event.isPublished,
      status: event.status,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt
      
    }));

    res.status(200).json({
      success: true,
      message: 'Events retrieved successfully',
      data: formattedEvents,
      count: formattedEvents.length
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// GET SINGLE EVENT BY ID ------> FOR USERS,ORGANIZERS,ADMIN
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate("category", "name")
      .populate("venue")
      .exec();

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    return res.status(200).json({
      success: true,
      event,
    });

  } catch (error) {
    console.error("Get Event By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server problem.",
    });
  }
};
