


import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import { Event, Order, Ticket } from '../model/schema.js';

//  Create a new order
export const createOrder = async (req, res) => {
    try {
        const { eventId, ticketType, quantity, totalAmount } = req.body;
        
        const userId = req.user.id;
        if(!userId){
            console.log("userId not found");
            return res.status(404).json({success:false,message:"userId not found"})
            
        }

        if (!eventId || !ticketType || !quantity || !totalAmount) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check event status
        const now = new Date();
        const endDate = new Date(event.endDate);

        if (endDate < now) {
            return res.status(400).json({
                success: false,
                message: 'Event has already ended'
            });
        }

        // Check ticket availability
        const ticketPriceField = ticketType === 'normal' ? 'normalPrice' : 'vipPrice';
        const availableTickets = event[ticketPriceField]?.quantity || 0;

        if (availableTickets < quantity) {
            return res.status(409).json({
                success: false,
                message: `Only ${availableTickets} ${ticketType} tickets available`
            });
        }

        // Calculate final price
        const pricePerTicket = event[ticketPriceField]?.price || 0;

        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        
        const order = new Order({
            user: userId,
            event: eventId,
            ticketType, 
            price: pricePerTicket,
            quantity,
            totalAmount,
            paymentStatus: 'pending',
            orderNumber,
        });

        await order.save();

        // // Generate tickets
        // const tickets = [];
        // const qrCodes = [];

        // for (let i = 0; i < quantity; i++) {
        //     const ticketId = uuidv4();

        //     // Generate QR Code
        //     const qrData = JSON.stringify({
        //         ticketId,
        //         eventId,
        //         userId,
        //         ticketType,
        //         orderId: order._id
        //     });

        //     const qrCodeImage = await QRCode.toDataURL(qrData);

        //     const ticket = new Ticket({
        //         event: eventId,
        //         user: userId,
        //         ticketType,
        //         price: pricePerTicket,
        //         qrCode: qrCodeImage,
        //         ticketCode: `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        //         order: order._id
        //     });

        //     await ticket.save();
        //     tickets.push(ticket);
        //     qrCodes.push(qrCodeImage);
        // }

        // // Update ticket availability in event
        // event[ticketPriceField].quantity -= quantity;
        // event.totalTicketsSold = (event.totalTicketsSold || 0) + quantity;
        // await event.save();

        // // Update order with ticket references
        // order.tickets = tickets.map(ticket => ticket._id);
        // await order.save();

        // // In production, we should integrate with payment gateway(CHAPA with telebirr)
        // // For now, simulate payment success
        // order.paymentStatus = 'pending';
        // await order.save();


        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error creating order',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user orders
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id

        const orders = await Order.find({ user: userId })
            .populate({
                path: 'event',
                select: 'title image startDate endDate venue category',
                populate: [
                    {
                        path: 'venue',
                        select: 'name city address'
                    },
                    {
                        path: 'category',
                        select: 'name'
                    }
                ]
            })
            .populate('tickets', 'ticketCode ticketType price isUsed')
            .sort({ createdAt: -1 });

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            event: {
                _id: order.event?._id,
                title: order.event?.title,
                image: order.event?.image,
                startDate: order.event?.startDate,
                endDate: order.event?.endDate,
                venue: order.event?.venue,
                category: order.event?.category
            },
            tickets: order.tickets,
            ticketType: order.ticketType,
            quantity: order.quantity,

        }));

        res.json({
            success: true,
            orders: formattedOrders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching orders'
        });
    }
};

// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('event', 'title image startDate venue')
            .populate('user', 'name email')
            .populate('tickets');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching order'
        });
    }
};

// @desc    Cancel order

export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is authorized
        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (order.paymentStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order is already cancelled'
            });
        }

        // Check event date for cancellation policy
        const event = await Event.findById(order.event);
        const eventStartDate = new Date(event.startDate);
        const now = new Date();
        const hoursUntilEvent = (eventStartDate - now) / (1000 * 60 * 60);

        // Example cancellation policy: No cancellation within 24 hours of event
        if (hoursUntilEvent < 24) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel order within 24 hours of event'
            });
        }

        // Update order status
        order.paymentStatus = 'cancelled';
        await order.save();

        // Return tickets to availability
        const ticketPriceField = order.tickets[0].ticketType === 'normal' ? 'normalPrice' : 'vipPrice';
        event[ticketPriceField].quantity += order.tickets[0].quantity;
        event.totalTicketsSold -= order.tickets[0].quantity;
        await event.save();

        // Delete tickets
        await Ticket.deleteMany({ order: order._id });

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error cancelling order'
        });
    }
};
