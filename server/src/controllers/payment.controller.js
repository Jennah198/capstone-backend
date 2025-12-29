import axios from "axios";
import { Payment, Order, Ticket, Event } from "../model/schema.js";

// export const pay = async (req, res) => {
//   const { first_name, last_name, email, phone_number, amount } = req.body;

//   try {
//     // Simple demo tx_ref
//     const tx_ref = `TX-${Date.now()}`;
//     console.log(tx_ref);

//     // ✅ Call initialize on the instance
//     const response = await chapa.initialize({
//       first_name,
//       last_name,
//       email,
//       phone_number,
//       currency: "ETB",
//       amount,
//       tx_ref,
//       // callback_url: "https://example.com/callback",
//       // return_url: "https://google.com/",
//       customization: {
//         title: "Demo Payment",
//         description: "This is a demo transaction",
//       },
//     });

//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Payment failed" });
//   }
// };

// export const verify = async (req, res) => {
//   const { tx_ref } = req.params;

//   try {
//     const response = await axios.get(
//       `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
//         },
//       }
//     );

//     const data = response.data;

//     if (data.status === "success") {
//       // Payment successful ✅
//       // You can update database, send email, etc.
//       res.json({
//         message: "Payment verified successfully",
//         payment: data.data,
//       });
//     } else {
//       // Payment failed or pending ❌
//       res.status(400).json({ message: "Payment verification failed", data });
//     }
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res
//       .status(500)
//       .json({ message: "Error verifying payment", error: err.message });
//   }
// };

// export const chapaCallback = async (req, res) => {
//   const { tx_ref } = req.body;

//   if (!tx_ref) {
//     return res.status(400).json({ message: "tx_ref is required" });
//   }

//   try {
//     // 1️⃣ Verify payment with Chapa
//     const response = await axios.get(
//       `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
//       {
//         headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
//       }
//     );

//     const data = response.data.data;

//     if (!data || data.status !== "success") {
//       return res.status(400).json({ message: "Payment not successful", data });
//     }

//     // 2️⃣ Find Payment record in DB
//     const payment = await Payment.findOne({ tx_ref }).populate("order");

//     if (!payment) {
//       return res.status(404).json({ message: "Payment record not found" });
//     }

//     // ✅ Idempotent: check if already successful
//     if (payment.status === "SUCCESS") {
//       return res.sendStatus(200); // Already processed
//     }

//     // 3️⃣ Update Payment record
//     payment.status = "SUCCESS";
//     payment.chapaRef = data.reference;
//     payment.amount = data.amount;
//     payment.currency = data.currency;
//     await payment.save();

//     // 4️⃣ Update Order record
//     const order = await Order.findById(payment.order._id);
//     order.paymentStatus = "paid";
//     await order.save();

//     // 5️⃣ Generate tickets
//     const event = await Event.findById(order.event);
//     for (let i = 0; i < order.quantity; i++) {
//       await Ticket.create({
//         event: event._id,
//         user: order.user,
//         order: order._id,
//         ticketType: order.ticketType,
//         price: order.price,
//         ticketCode: `TICKET-${Date.now()}-${i}`,
//       });
//     }

//     // 6️⃣ Respond to Chapa
//     res.sendStatus(200);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.sendStatus(500); // Chapa will retry webhook if not 200
//   }
// };

export const pay = async (req, res) => {
  const { orderId, first_name, last_name, email, phone_number } = req.body;

  if (!orderId || !first_name || !last_name || !email || !phone_number) {
    return res.status(400).json({ message: "Missing required payment fields" });
  }

  try {
    // Use phone number as provided (assuming it's in correct Ethiopian format)
    const formattedPhone = phone_number.trim();

    const tx_ref = `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });

    const amount = order.totalAmount;
    // Create Payment record as SUCCESS
    const payment = await Payment.create({
      order: order._id,
      user: order.user,
      tx_ref,
      amount,
      currency: "ETB",
      status: "SUCCESS",
      chapaRef: `MOCK-${tx_ref}`,
    });

    // Update Order record to paid
    order.paymentStatus = "paid";
    await order.save();

    // Generate tickets
    const event = await Event.findById(order.event);
    const tickets = [];
    for (let i = 0; i < order.quantity; i++) {
      const ticket = await Ticket.create({
        event: event._id,
        user: order.user,
        order: order._id,
        ticketType: order.ticketType,
        price: order.price,
        ticketCode: `TICKET-${Date.now()}-${i}`,
      });
      tickets.push(ticket);
    }

    res.json({ success: true, tx_ref, payment, order, tickets, event });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ error: "Payment failed", details: err.message });
  }
};

export const verify = async (req, res) => {
  const { tx_ref } = req.params; // frontend sends tx_ref

  try {
    // 1️⃣ Verify payment with Chapa
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      }
    );

    const data = response.data.data;

    if (!data || data.status !== "success") {
      // Payment failed or pending
      return res.status(400).json({ message: "Payment not successful", data });
    }

    // 2️⃣ Find Payment record
    const payment = await Payment.findOne({ tx_ref }).populate("order");
    if (!payment)
      return res.status(404).json({ message: "Payment record not found" });

    // 3️⃣ Idempotency check: already successful?
    if (payment.status === "SUCCESS") {
      return res.json({ message: "Payment already verified", payment });
    }

    // 4️⃣ Update Payment record
    payment.status = "SUCCESS";
    payment.chapaRef = data.reference;
    payment.amount = data.amount;
    payment.currency = data.currency;
    await payment.save();

    // 5️⃣ Update Order record
    const order = await Order.findById(payment.order._id);
    order.paymentStatus = "paid";
    await order.save();

    // 6️⃣ Generate tickets
    const event = await Event.findById(order.event);
    for (let i = 0; i < order.quantity; i++) {
      await Ticket.create({
        event: event._id,
        user: order.user,
        order: order._id,
        ticketType: order.ticketType,
        price: order.price,
        ticketCode: `TICKET-${Date.now()}-${i}`,
      });
    }

    // 7️⃣ Return success to frontend
    res.json({
      message: "Payment verified successfully",
      // payment,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res
      .status(500)
      .json({ message: "Error verifying payment", error: err.message });
  }
};

export const chapaCallback = async (req, res) => {
  const { tx_ref } = req.params;
  console.log(tx_ref);
  if (!tx_ref) {
    return res.status(400).json({ message: "tx_ref is required" });
  }

  try {
    // 1️⃣ Verify payment with Chapa
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
      }
    );

    const data = response.data.data;

    if (!data || data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful", data });
    }

    // 2️⃣ Find Payment record
    const payment = await Payment.findOne({ tx_ref }).populate("order");
    if (!payment)
      return res.status(404).json({ message: "Payment record not found" });

    // 3️⃣ Idempotency check
    if (payment.status === "SUCCESS") {
      return res.sendStatus(200); // Already processed
    }

    // 4️⃣ Update Payment
    payment.status = "SUCCESS";
    payment.chapaRef = data.reference;
    payment.amount = data.amount;
    payment.currency = data.currency;
    await payment.save();

    // 5️⃣ Update Order
    const order = await Order.findById(payment.order._id);
    order.paymentStatus = "paid";
    await order.save();

    // 6️⃣ Generate Tickets
    const event = await Event.findById(order.event);
    for (let i = 0; i < order.quantity; i++) {
      await Ticket.create({
        event: event._id,
        user: order.user,
        order: order._id,
        ticketType: order.ticketType,
        price: order.price,
        ticketCode: `TICKET-${Date.now()}-${i}`,
      });
    }

    // 7️⃣ Respond to Chapa
    res.sendStatus(200).json({
      message: "Payment processed successfully",
      payment,
      order,
      event,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.sendStatus(500);
  }
};
