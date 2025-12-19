
import { User,Event,Order,Ticket,Category,Venue } from "../model/schema.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get current date and last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    

    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalVenues = await Venue.countDocuments();
    
  
    const totalRevenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;
    
  
    const publishedEvents = await Event.countDocuments({ isPublished: true });
    
    const pendingOrders = await Order.countDocuments({ paymentStatus: 'pending' });

    const totalTicketsSold = await Ticket.countDocuments();
    
    // Get user role distribution
    const userRoles = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const recentOrders = await Order.find()
      .populate('user', 'name')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    const recentEvents = await Event.find()
      .populate('organizer', 'name')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalOrders,
        totalCategories,
        totalVenues,
        
        totalRevenue,
        pendingOrders,
        

        publishedEvents,
        unpublishedEvents: totalEvents - publishedEvents,
        

        totalTicketsSold,
        
        // User distribution
        userRoles: userRoles.reduce((acc, role) => {
          acc[role._id] = role.count;
          return acc;
        }, {}),
        
        recentOrders,
        recentEvents
      }
    });
    
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const updateEventPublishStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { isPublished } = req.body;
    
    const event = await Event.findByIdAndUpdate(
      eventId,
      { isPublished },
      { new: true }
    ).populate('organizer', 'name email');
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.json({ success: true, event, isPublished });
  } catch (error) {
    console.error('Update publish status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



// GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('event', 'title image')
      .populate('tickets')
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      orders 
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error fetching orders' 
    });
  }
};

// UPDATE ORDER STATTUS
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { paymentStatus: status },
      { new: true }
    )
    .populate('user', 'name email')
    .populate('event', 'title');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status'
    });
  }
};


// DELETE ORDER
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Also delete associated tickets
    await Ticket.deleteMany({ order: id });

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting order'
    });
  }
};